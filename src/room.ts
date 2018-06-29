import * as socketio from 'socket.io';

interface RoomList {
  [key: string]: socketio.Socket[]
};
const rooms: RoomList = {};

interface SocketIdToName {
  [key: string]: string
};
const socketIdToName: SocketIdToName = {};

export function makeRoomClient(
  socket: socketio.Socket, username: string, global: socketio.Server
): void {
  socketIdToName[socket.id] = username;
  socket.on('newRoom', () => {
    rooms[username] = [socket];
    global.emit('newRoom', username);
  });
  socket.on('enterRoom', master => {
    rooms[master].forEach(socket => {
      socket.emit('enterRoom', username);
    });
    rooms[master].push(socket);
    socket.emit('roomMember', rooms[master].map(s => socketIdToName[s.id]));
    global.emit('changeRoom', {
      room: master,
      size: rooms[master].length
    });
  });
}