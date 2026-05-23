import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/queue' })
export class QueueGateway {
  @WebSocketServer()
  server: Server;

  emitQueueUpdate() {
    this.server?.emit('queue.updated', { at: new Date().toISOString() });
  }
}
