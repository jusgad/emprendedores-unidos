import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    const serverUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
    
    this.socket = io(serverUrl, {
      auth: {
        token: token
      }
    });

    this.socket.on('connect', () => {
      console.log('🔌 Conectado al servidor WebSocket');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Desconectado del servidor WebSocket');
    });

    this.socket.on('error', (error) => {
      console.error('❌ Error WebSocket:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      
      if (this.listeners.has(event)) {
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  joinConversation(otherUserId) {
    this.emit('join-conversation', { otherUserId });
  }

  sendMessage(receiverId, content, type = 'texto') {
    this.emit('send-message', { receiverId, content, type });
  }

  markMessagesRead(conversationId) {
    this.emit('mark-messages-read', { conversationId });
  }

  getConversations() {
    this.emit('get-conversations');
  }

  getMessages(conversationId, limit = 50, offset = 0) {
    this.emit('get-messages', { conversationId, limit, offset });
  }

  setTyping(receiverId, typing) {
    this.emit('user-typing', { receiverId, typing });
  }

  removeAllListeners() {
    if (this.socket) {
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          this.socket.off(event, callback);
        });
      });
      this.listeners.clear();
    }
  }
}

export const socketService = new SocketService();
export default socketService;