import * as socketio from 'socket.io';

interface RoomList {
  [key: string]: {
    master: string,
    members: socketio.Socket[],
    pattern: number;
    split: number
  }
};
const rooms: RoomList = {};

interface SocketIdToName {
  [key: string]: string
};
const socketIdToName: SocketIdToName = {};

export function makeRoomClient(
  socket: socketio.Socket, username: string, global: socketio.Server
): void {
  let currentRoom: string|undefined;
  socketIdToName[socket.id] = username;
  socket.on('newRoom', (params) => {
    const { split, pattern } = params;
    rooms[username] = { master: username, members: [socket], pattern, split };
    global.emit('newRoom', { username, size: 1, pattern, split });
  });
  socket.on('enterRoom', master => {
    if (currentRoom !== undefined)
      return;
    currentRoom = master;
    rooms[master].members.forEach(socket => {
      socket.emit('enterRoom', username);
    });
    rooms[master].members.push(socket);
    socket.emit('roomMember', rooms[master].members.map(s =>
      socketIdToName[s.id]
    ));
    global.emit('changeRoom', {
      room: master, size: rooms[master].members.length
    });
  });
  socket.on('leaveRoom', () => {
    if (currentRoom === undefined)
      return;
    global.emit('changeRoom', {
      room: currentRoom, size: rooms[currentRoom].members.length
    });
    let i = rooms[currentRoom].members.findIndex(s => s.id === socket.id);
    rooms[currentRoom].members.splice(i, 1);
    rooms[currentRoom].members.forEach(socket => {
      socket.emit('leaveRoom', username);
    });
    currentRoom = undefined;
  });
  socket.on('roomList', () => {
    socket.emit('roomList', Object.values(rooms).map(room => ({
      username: room.master,
      size: room.members.length,
      pattern: room.pattern,
      split: room.split
    })));
  });
  socket.on('startGame', () => {
    rooms[username].members.forEach(s => { s.emit('startGame'); });
    delete rooms[username];
    global.emit('deleteRoom', username);
  });
  socket.on('deleteRoom', () => {
    global.emit('deleteRoom', username);
    rooms[username].members.forEach(s => {
      s.emit('cancelRoom');
    });
    delete rooms[username];
  });
}