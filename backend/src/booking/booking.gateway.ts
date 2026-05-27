import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class BookingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(BookingGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_restaurant_room')
  handleJoinRestaurant(
    @ConnectedSocket() client: Socket,
    @MessageBody() restaurantId: number,
  ) {
    const room = `restaurant_${restaurantId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
    return { status: 'ok', room };
  }

  @SubscribeMessage('join_user_room')
  handleJoinUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: number,
  ) {
    const room = `user_${userId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
    return { status: 'ok', room };
  }

  // Phương thức gửi thông báo khi có đặt bàn mới cho chủ quán
  notifyNewBooking(restaurantId: number, booking: any) {
    const room = `restaurant_${restaurantId}`;
    if (this.server) {
      this.server.to(room).emit('new_booking', booking);
      this.logger.log(`Emitted new_booking to room ${room}`);
    } else {
      this.logger.warn(`Socket.io server not initialized. Cannot emit new_booking to room ${room}`);
    }
  }

  // Phương thức gửi thông báo khi cập nhật trạng thái đặt bàn cho khách
  notifyBookingStatus(userId: number, booking: any) {
    const room = `user_${userId}`;
    if (this.server) {
      this.server.to(room).emit('booking_status_updated', booking);
      this.logger.log(`Emitted booking_status_updated to room ${room}`);
    } else {
      this.logger.warn(`Socket.io server not initialized. Cannot emit booking_status_updated to room ${room}`);
    }
  }
}
