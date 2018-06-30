import * as socketio from 'socket.io';
import { Room } from './room';

export function gameRoom(room: Room) {
  room.members.forEach(s => {
    const username = room.idToName[s.id];
    s.on('pickPiece', pieceIndex => {
      room.broadcast('pickPiece', { pieceIndex, username }, s);
    });
    s.on('moveTo', data => {
      const { X, Y } = data;
      room.broadcast('moveTo', { X, Y, username }, s);
    });
    s.on('releasePiece', () => {
      room.broadcast('releasePiece', { username }, s);
    });
  });
}