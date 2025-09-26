const nodemailer = require('nodemailer');
const { pool } = require('../db/connection');

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

const sendOrderConfirmationEmail = async (pedidoId) => {
  try {
    const pedidoResult = await pool.query(`
      SELECT p.*, u.nombre as comprador_nombre, u.email as comprador_email,
             array_agg(
               json_build_object(
                 'nombre', pr.nombre,
                 'cantidad', ip.cantidad,
                 'precio_unitario', ip.precio_unitario,
                 'subtotal', ip.cantidad * ip.precio_unitario,
                 'tienda_nombre', t.nombre_tienda,
                 'vendedor_email', uv.email,
                 'vendedor_nombre', uv.nombre
               )
             ) as items
      FROM pedidos p
      JOIN usuarios u ON p.comprador_id = u.id
      JOIN items_pedido ip ON p.id = ip.pedido_id
      JOIN productos pr ON ip.producto_id = pr.id
      JOIN tiendas t ON pr.tienda_id = t.id
      JOIN usuarios uv ON t.usuario_id = uv.id
      WHERE p.id = $1
      GROUP BY p.id, u.nombre, u.email
    `, [pedidoId]);

    if (pedidoResult.rows.length === 0) {
      throw new Error('Pedido no encontrado');
    }

    const pedido = pedidoResult.rows[0];
    const direccion = JSON.parse(pedido.direccion_envio);

    const emailCompradorHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmación de Pedido - Emprendedores Unidos</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .item { border-bottom: 1px solid #ddd; padding: 10px 0; }
          .total { font-weight: bold; font-size: 18px; color: #4F46E5; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Gracias por tu compra!</h1>
            <p>Pedido #${pedido.id}</p>
          </div>
          <div class="content">
            <h2>Hola ${pedido.comprador_nombre},</h2>
            <p>Tu pedido ha sido confirmado y está siendo procesado.</p>
            
            <h3>Detalles del Pedido:</h3>
            ${pedido.items.map(item => `
              <div class="item">
                <strong>${item.nombre}</strong><br>
                Tienda: ${item.tienda_nombre}<br>
                Cantidad: ${item.cantidad} x $${item.precio_unitario.toLocaleString()}<br>
                Subtotal: $${item.subtotal.toLocaleString()}
              </div>
            `).join('')}
            
            <div class="total">
              <p>Subtotal: $${(pedido.total - pedido.costo_envio - pedido.impuestos).toLocaleString()}</p>
              <p>Envío: $${pedido.costo_envio.toLocaleString()}</p>
              <p>Impuestos: $${pedido.impuestos.toLocaleString()}</p>
              <p>Total: $${pedido.total.toLocaleString()}</p>
            </div>
            
            <h3>Dirección de Envío:</h3>
            <p>
              ${direccion.direccion}<br>
              ${direccion.ciudad}, ${direccion.departamento}<br>
              ${direccion.codigo_postal || ''}
            </p>
            
            <p>Te notificaremos cuando tu pedido sea enviado.</p>
          </div>
          <div class="footer">
            <p>Emprendedores Unidos - Conectando emprendedores</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const vendedoresEmails = new Map();
    pedido.items.forEach(item => {
      if (!vendedoresEmails.has(item.vendedor_email)) {
        vendedoresEmails.set(item.vendedor_email, {
          nombre: item.vendedor_nombre,
          items: []
        });
      }
      vendedoresEmails.get(item.vendedor_email).items.push(item);
    });

    try {
      const mailOptionsComprador = {
        from: process.env.SMTP_FROM || 'noreply@emprendedoresunidos.com',
        to: pedido.comprador_email,
        subject: `Confirmación de Pedido #${pedido.id} - Emprendedores Unidos`,
        html: emailCompradorHTML
      };

      await transporter.sendMail(mailOptionsComprador);
      console.log(`Email de confirmación enviado a comprador: ${pedido.comprador_email}`);
    } catch (error) {
      console.log('Simulando envío de email al comprador:', pedido.comprador_email);
      console.log('Contenido del email:', mailOptionsComprador.subject);
    }

    for (const [vendedorEmail, vendedorData] of vendedoresEmails) {
      const emailVendedorHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Nuevo Pedido - Emprendedores Unidos</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #059669; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .item { border-bottom: 1px solid #ddd; padding: 10px 0; }
            .highlight { background: #e6f3ff; padding: 10px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡Nuevo Pedido Recibido!</h1>
              <p>Pedido #${pedido.id}</p>
            </div>
            <div class="content">
              <h2>Hola ${vendedorData.nombre},</h2>
              <p>Has recibido un nuevo pedido en tu tienda.</p>
              
              <div class="highlight">
                <strong>Cliente:</strong> ${pedido.comprador_nombre}<br>
                <strong>Email:</strong> ${pedido.comprador_email}
              </div>
              
              <h3>Productos Vendidos:</h3>
              ${vendedorData.items.map(item => `
                <div class="item">
                  <strong>${item.nombre}</strong><br>
                  Cantidad: ${item.cantidad}<br>
                  Precio unitario: $${item.precio_unitario.toLocaleString()}<br>
                  Total: $${item.subtotal.toLocaleString()}
                </div>
              `).join('')}
              
              <h3>Dirección de Envío:</h3>
              <p>
                ${direccion.direccion}<br>
                ${direccion.ciudad}, ${direccion.departamento}<br>
                ${direccion.codigo_postal || ''}
              </p>
              
              <p><strong>Ingresa a tu panel de vendedor para gestionar este pedido.</strong></p>
            </div>
          </div>
        </body>
        </html>
      `;

      try {
        const mailOptionsVendedor = {
          from: process.env.SMTP_FROM || 'noreply@emprendedoresunidos.com',
          to: vendedorEmail,
          subject: `Nuevo Pedido #${pedido.id} - ${vendedorData.items.length} producto(s)`,
          html: emailVendedorHTML
        };

        await transporter.sendMail(mailOptionsVendedor);
        console.log(`Email de nuevo pedido enviado a vendedor: ${vendedorEmail}`);
      } catch (error) {
        console.log('Simulando envío de email al vendedor:', vendedorEmail);
        console.log('Productos vendidos:', vendedorData.items.length);
      }
    }

  } catch (error) {
    console.error('Error enviando emails de confirmación:', error);
    throw error;
  }
};

const sendOrderStatusUpdate = async (pedidoId, nuevoEstado, numeroTracking = null) => {
  try {
    const pedidoResult = await pool.query(`
      SELECT p.*, u.nombre as comprador_nombre, u.email as comprador_email
      FROM pedidos p
      JOIN usuarios u ON p.comprador_id = u.id
      WHERE p.id = $1
    `, [pedidoId]);

    if (pedidoResult.rows.length === 0) {
      throw new Error('Pedido no encontrado');
    }

    const pedido = pedidoResult.rows[0];
    let asunto, mensaje;

    switch (nuevoEstado) {
      case 'enviado':
        asunto = `Tu pedido #${pedido.id} ha sido enviado`;
        mensaje = `Tu pedido ha sido enviado y está en camino.${numeroTracking ? ` Número de tracking: ${numeroTracking}` : ''}`;
        break;
      case 'entregado':
        asunto = `Tu pedido #${pedido.id} ha sido entregado`;
        mensaje = 'Tu pedido ha sido entregado exitosamente. ¡Esperamos que disfrutes tu compra!';
        break;
      case 'cancelado':
        asunto = `Tu pedido #${pedido.id} ha sido cancelado`;
        mensaje = 'Tu pedido ha sido cancelado. Si tienes preguntas, contáctanos.';
        break;
      default:
        return;
    }

    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${asunto}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Actualización de Pedido</h1>
          </div>
          <div class="content">
            <h2>Hola ${pedido.comprador_nombre},</h2>
            <p>${mensaje}</p>
            <p><strong>Pedido:</strong> #${pedido.id}</p>
            <p><strong>Estado:</strong> ${nuevoEstado.charAt(0).toUpperCase() + nuevoEstado.slice(1)}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@emprendedoresunidos.com',
        to: pedido.comprador_email,
        subject: asunto,
        html: emailHTML
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email de actualización enviado: ${pedido.comprador_email}`);
    } catch (error) {
      console.log('Simulando envío de email de actualización:', pedido.comprador_email);
      console.log('Nuevo estado:', nuevoEstado);
    }

  } catch (error) {
    console.error('Error enviando email de actualización:', error);
    throw error;
  }
};

const sendWelcomeEmail = async (usuario) => {
  const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Bienvenido a Emprendedores Unidos</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Bienvenido a Emprendedores Unidos!</h1>
        </div>
        <div class="content">
          <h2>Hola ${usuario.nombre},</h2>
          <p>¡Gracias por unirte a nuestra comunidad de emprendedores!</p>
          
          ${usuario.rol === 'vendedor' ? `
            <p>Como vendedor, puedes:</p>
            <ul>
              <li>Crear y gestionar tu tienda</li>
              <li>Publicar productos</li>
              <li>Conectar con compradores</li>
              <li>Participar en la comunidad</li>
            </ul>
          ` : `
            <p>Como comprador, puedes:</p>
            <ul>
              <li>Explorar productos únicos</li>
              <li>Apoyar emprendedores locales</li>
              <li>Seguir tus tiendas favoritas</li>
              <li>Participar en la comunidad</li>
            </ul>
          `}
          
          <p>¡Comienza a explorar la plataforma!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@emprendedoresunidos.com',
      to: usuario.email,
      subject: 'Bienvenido a Emprendedores Unidos',
      html: emailHTML
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email de bienvenida enviado: ${usuario.email}`);
  } catch (error) {
    console.log('Simulando envío de email de bienvenida:', usuario.email);
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdate,
  sendWelcomeEmail
};