import * as socketio from 'socket.io';
import { Room } from './room';

export function gameRoom(room: Room) {
  room.gaming = true;
  room.members.forEach(s => {
    const username = s.username;
    s.on('pickPiece', pieceIndex => {
      room.broadcast('pickPiece', { pieceIndex, username }, s);
    });
    s.on('movePieceTo', data => {
      const { X, Y } = data;
      room.broadcast('movePieceTo', { X, Y, username }, s);
    });
    s.on('releasePiece', () => {
      room.broadcast('releasePiece', { username }, s);
    });
  });
}