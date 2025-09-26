const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/connection');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Token requerido'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
      
      const result = await pool.query(
        'SELECT id, email, rol, nombre FROM usuarios WHERE id = $1 AND activo = true',
        [decoded.id]
      );

      if (result.rows.length === 0) {
        return next(new Error('Usuario no encontrado'));
      }

      socket.user = result.rows[0];
      next();
    } catch (error) {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Usuario ${socket.user.nombre} conectado (${socket.user.id})`);
    
    socket.join(`user-${socket.user.id}`);

    socket.on('join-conversation', async (data) => {
      try {
        const { otherUserId } = data;
        
        const conversationId = [socket.user.id, otherUserId].sort().join('-');
        socket.join(conversationId);
        
        console.log(`Usuario ${socket.user.id} se unió a conversación ${conversationId}`);

        const result = await pool.query(`
          SELECT c.*, 
                 CASE WHEN c.comprador_id = $1 THEN u2.nombre ELSE u1.nombre END as other_user_name
          FROM conversaciones c
          JOIN usuarios u1 ON c.comprador_id = u1.id
          JOIN usuarios u2 ON c.vendedor_id = u2.id
          WHERE (c.comprador_id = $1 AND c.vendedor_id = $2) 
             OR (c.comprador_id = $2 AND c.vendedor_id = $1)
        `, [socket.user.id, otherUserId]);

        if (result.rows.length === 0) {
          const newConversation = await pool.query(`
            INSERT INTO conversaciones (comprador_id, vendedor_id)
            VALUES ($1, $2)
            RETURNING *
          `, [
            Math.min(socket.user.id, otherUserId),
            Math.max(socket.user.id, otherUserId)
          ]);
          
          socket.emit('conversation-created', newConversation.rows[0]);
        } else {
          socket.emit('conversation-joined', result.rows[0]);
        }

      } catch (error) {
        console.error('Error joining conversation:', error);
        socket.emit('error', 'Error al unirse a la conversación');
      }
    });

    socket.on('send-message', async (data) => {
      try {
        const { receiverId, content, type = 'texto' } = data;
        
        let conversationResult = await pool.query(`
          SELECT id FROM conversaciones
          WHERE (comprador_id = $1 AND vendedor_id = $2) 
             OR (comprador_id = $2 AND vendedor_id = $1)
        `, [socket.user.id, receiverId]);

        let conversationId;
        if (conversationResult.rows.length === 0) {
          const newConversation = await pool.query(`
            INSERT INTO conversaciones (comprador_id, vendedor_id)
            VALUES ($1, $2)
            RETURNING id
          `, [
            Math.min(socket.user.id, receiverId),
            Math.max(socket.user.id, receiverId)
          ]);
          conversationId = newConversation.rows[0].id;
        } else {
          conversationId = conversationResult.rows[0].id;
        }

        const messageResult = await pool.query(`
          INSERT INTO mensajes (conversacion_id, remitente_id, contenido, tipo)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `, [conversationId, socket.user.id, content, type]);

        await pool.query(`
          UPDATE conversaciones 
          SET ultimo_mensaje = $1, fecha_ultimo_mensaje = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [content, conversationId]);

        const message = {
          ...messageResult.rows[0],
          remitente_nombre: socket.user.nombre,
          es_mio: true
        };

        const roomId = [socket.user.id, receiverId].sort().join('-');
        socket.to(roomId).emit('new-message', {
          ...message,
          es_mio: false
        });

        socket.emit('message-sent', message);

        socket.to(`user-${receiverId}`).emit('notification', {
          type: 'new-message',
          from: socket.user.nombre,
          message: content,
          timestamp: new Date()
        });

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', 'Error al enviar mensaje');
      }
    });

    socket.on('mark-messages-read', async (data) => {
      try {
        const { conversationId } = data;
        
        await pool.query(`
          UPDATE mensajes 
          SET leido = true 
          WHERE conversacion_id = $1 AND remitente_id != $2 AND leido = false
        `, [conversationId, socket.user.id]);

        socket.emit('messages-marked-read', { conversationId });

      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    socket.on('get-conversations', async () => {
      try {
        const result = await pool.query(`
          SELECT c.*, 
                 CASE WHEN c.comprador_id = $1 THEN u2.nombre ELSE u1.nombre END as other_user_name,
                 CASE WHEN c.comprador_id = $1 THEN u2.id ELSE u1.id END as other_user_id,
                 (SELECT COUNT(*) FROM mensajes WHERE conversacion_id = c.id AND remitente_id != $1 AND leido = false) as unread_count
          FROM conversaciones c
          JOIN usuarios u1 ON c.comprador_id = u1.id
          JOIN usuarios u2 ON c.vendedor_id = u2.id
          WHERE c.comprador_id = $1 OR c.vendedor_id = $1
          ORDER BY c.fecha_ultimo_mensaje DESC
        `, [socket.user.id]);

        socket.emit('conversations-list', result.rows);

      } catch (error) {
        console.error('Error getting conversations:', error);
        socket.emit('error', 'Error al obtener conversaciones');
      }
    });

    socket.on('get-messages', async (data) => {
      try {
        const { conversationId, limit = 50, offset = 0 } = data;

        const authResult = await pool.query(`
          SELECT id FROM conversaciones 
          WHERE id = $1 AND (comprador_id = $2 OR vendedor_id = $2)
        `, [conversationId, socket.user.id]);

        if (authResult.rows.length === 0) {
          socket.emit('error', 'No autorizado para esta conversación');
          return;
        }

        const result = await pool.query(`
          SELECT m.*, u.nombre as remitente_nombre,
                 CASE WHEN m.remitente_id = $1 THEN true ELSE false END as es_mio
          FROM mensajes m
          JOIN usuarios u ON m.remitente_id = u.id
          WHERE m.conversacion_id = $2
          ORDER BY m.fecha DESC
          LIMIT $3 OFFSET $4
        `, [socket.user.id, conversationId, limit, offset]);

        socket.emit('messages-history', {
          conversationId,
          messages: result.rows.reverse()
        });

      } catch (error) {
        console.error('Error getting messages:', error);
        socket.emit('error', 'Error al obtener mensajes');
      }
    });

    socket.on('user-typing', (data) => {
      const { receiverId, typing } = data;
      const roomId = [socket.user.id, receiverId].sort().join('-');
      
      socket.to(roomId).emit('user-typing', {
        userId: socket.user.id,
        userName: socket.user.nombre,
        typing
      });
    });

    socket.on('disconnect', () => {
      console.log(`Usuario ${socket.user.nombre} desconectado`);
    });
  });

  return io;
};

const sendNotification = (userId, notification) => {
  if (io) {
    io.to(`user-${userId}`).emit('notification', notification);
  }
};

const sendOrderNotification = async (pedidoId, type) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT p.comprador_id, t.usuario_id as vendedor_id, p.id, u.nombre as comprador_nombre
      FROM pedidos p
      JOIN items_pedido ip ON p.id = ip.pedido_id
      JOIN productos pr ON ip.producto_id = pr.id
      JOIN tiendas t ON pr.tienda_id = t.id
      JOIN usuarios u ON p.comprador_id = u.id
      WHERE p.id = $1
    `, [pedidoId]);

    for (const row of result.rows) {
      let notification;
      
      if (type === 'new-order') {
        notification = {
          type: 'new-order',
          title: 'Nuevo Pedido',
          message: `Tienes un nuevo pedido de ${row.comprador_nombre}`,
          orderId: row.id,
          timestamp: new Date()
        };
        sendNotification(row.vendedor_id, notification);
      } else if (type === 'order-confirmed') {
        notification = {
          type: 'order-confirmed',
          title: 'Pedido Confirmado',
          message: `Tu pedido #${row.id} ha sido confirmado`,
          orderId: row.id,
          timestamp: new Date()
        };
        sendNotification(row.comprador_id, notification);
      }
    }
  } catch (error) {
    console.error('Error sending order notification:', error);
  }
};

module.exports = {
  initializeSocket,
  sendNotification,
  sendOrderNotification
};