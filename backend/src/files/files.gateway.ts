import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/files' })
export class FilesGateway {
  @WebSocketServer()
  server: Server;

  emitPatientFilesUpdated(patientId: string) {
    const payload = { patientId, at: new Date().toISOString() };
    this.server?.emit('files.updated', payload);
  }
}
