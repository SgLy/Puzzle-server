import * as socketio from 'socket.io';
import { Room } from './room';

export function gameRoom(room: Room) {
  room.gaming = true;
  room.members.forEach(s => {
    const username = s.username;
    s.on('pickPiece', pieceIndex => {
      room.pieces[username] = parseInt(pieceIndex);
      room.broadcast('pickPiece', { pieceIndex, username }, s);
    });
    s.on('movePieceTo', data => {
      const { X, Y } = data;
      const pieceIndex = room.pieces[username];
      room.broadcast('movePieceTo', { X, Y, username, pieceIndex }, s);
    });
    s.on('rotatePiece', data => {
      const pieceIndex = room.pieces[username];
      room.broadcast('rotatePiece', { username, pieceIndex }, s);
    })
    s.on('releasePiece', () => {
      const pieceIndex = room.pieces[username];
      delete room.pieces[username];
      room.broadcast('releasePiece', { username, pieceIndex }, s);
    });
  });
}