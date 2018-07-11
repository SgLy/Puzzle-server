import * as socketio from 'socket.io';
import { gameRoom } from './game';
import { Socket, SocketGlobal, Room, Rooms } from './socket';

export const rooms: Rooms = {};
const roomList = (rooms: Rooms) =>
  Object.values(rooms)
    .filter(r => !r.gaming)
    .map(room => room.detail);

export function makeRoomClient(
  _socket: socketio.Socket, username: string, _global: socketio.Server
): void {
  const socket = new Socket(_socket, username);
  const global = new SocketGlobal(_global);
  socket.on('newRoom', (params) => {
    const { split, pattern } = params;
    rooms[username] = new Room(username, pattern, split);
    rooms[username].addMember(socket);
    global.emit('roomList', { rooms: roomList(rooms) });
  });
  socket.on('enterRoom', master => {
    if (socket.currentRoom !== undefined)
      return;
    const room = rooms[master];
    room.addMember(socket);
    room.broadcast('roomMember', { members: room.memberList });
    global.emit('roomList', { rooms: roomList(rooms) });
  });
  socket.on('leaveRoom', () => {
    if (socket.currentRoom === undefined)
      return;
    const room = socket.currentRoom;
    room.removeMember(socket);
    global.emit('roomList', { rooms: roomList(rooms) });
    room.broadcast('roomMember', { members: room.memberList });
  });
  socket.on('roomList', () => {
    socket.emit('roomList', { rooms: roomList(rooms) });
  });
  socket.on('startGame', () => {
    rooms[username].broadcast('startGame');
    gameRoom(rooms[username]);
    global.emit('roomList', { rooms: roomList(rooms) });
  });
  socket.on('deleteRoom', () => {
    rooms[username].broadcast('cancelRoom');
    rooms[username].destroy();
    delete rooms[username];
    global.emit('roomList', { rooms: roomList(rooms) });
  });
  socket.on('disconnect', () => {
    if (socket.currentRoom === undefined)
      return;
    const room = socket.currentRoom;
    if (room.master === socket.username) {
      rooms[username].broadcast('cancelRoom');
      rooms[username].destroy();
      delete rooms[username];
      global.emit('roomList', { rooms: roomList(rooms) });
    } else {
      room.removeMember(socket);
      global.emit('roomList', { rooms: roomList(rooms) });
      room.broadcast('roomMember', { members: room.memberList });
    }
  })
}
