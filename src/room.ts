import * as socketio from 'socket.io';
import { gameRoom } from './game';

export class Room {
  public master: string;
  public members: socketio.Socket[];
  public split: number;
  public pattern: number;
  public idToName: { [key: string]: string };
  constructor(master: string, pattern: number, split: number) {
    this.master = master;
    this.pattern = pattern;
    this.split = split;
    this.members = [];
    this.idToName = {};
  }

  addMember(s: socketio.Socket, username: string) {
    this.members.push(s);
    this.idToName[s.id] = username;
  }

  removeMember(s: socketio.Socket) {
    const i = this.members.findIndex(m => m.id === s.id);
    this.members.splice(i, 1);
  }

  broadcast(event: string, args?: any, exclude?: socketio.Socket) {
    this.members.forEach(s => {
      if (exclude !== undefined && s.id === exclude.id)
        return;
      s.emit(event, args);
    });
  }

  get memberList() {
    return this.members.map(s => this.idToName[s.id]);
  }

  get size() {
    return this.members.length;
  }

  get detail() {
    return {
      username: this.master,
      size: this.size,
      pattern: this.pattern,
      split: this.split
    }
  }
}

interface RoomList {
  [key: string]: Room
};
const rooms: RoomList = {};

export function makeRoomClient(
  socket: socketio.Socket, username: string, global: socketio.Server
): void {
  let currentRoom: string|undefined;
  socket.on('newRoom', (params) => {
    const { split, pattern } = params;
    rooms[username] = new Room(username, pattern, split);
    rooms[username].addMember(socket, username);
    // global.emit('roomList', { username, size: 1, pattern, split });
    global.emit('roomList', {
      rooms: Object.values(rooms).map(room => room.detail)
    });
  });
  socket.on('enterRoom', master => {
    if (currentRoom !== undefined)
      return;
    currentRoom = master;
    const room = rooms[master];
    room.broadcast('enterRoom', username);
    room.addMember(socket, username);
    socket.emit('roomMember', {
      members: room.memberList
    });
    global.emit('changeRoom', { room: master, size: room.size });
  });
  socket.on('leaveRoom', () => {
    if (currentRoom === undefined)
      return;
    const room = rooms[currentRoom];
    global.emit('changeRoom', { room: currentRoom, size: room.members.length });
    room.removeMember(socket);
    room.broadcast('leaveRoom', username);
    currentRoom = undefined;
  });
  socket.on('roomList', () => {
    socket.emit('roomList', {
      rooms: Object.values(rooms).map(room => room.detail)
    });
  });
  socket.on('startGame', () => {
    rooms[username].broadcast('startGame');
    gameRoom(rooms[username]);
    delete rooms[username];
    // global.emit('deleteRoom', username);
    global.emit('roomList', {
      rooms: Object.values(rooms).map(room => room.detail)
    });
  });
  socket.on('deleteRoom', () => {
    // global.emit('deleteRoom', username);
    rooms[username].broadcast('cancelRoom');
    delete rooms[username];
    global.emit('roomList', {
      rooms: Object.values(rooms).map(room => room.detail)
    });
  });
}