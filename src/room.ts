import * as socketio from 'socket.io';
import { gameRoom } from './game';

class Socket {
  private socket: socketio.Socket;
  public username: string;
  constructor(socket: socketio.Socket, username: string) {
    this.socket = socket;
    this.username = username;
  }

  emit(event: string, ...args: any[]) {
    console.log(`[EMIT] ${this.username} ${event} ${JSON.stringify(args)}`);
    this.socket.emit(event, args);
  }

  on(event: string, listener: (...args: any[]) => void) {
    this.socket.on(event, (args) => {
      console.log(`[ ON ] ${this.username} ${event} ${JSON.stringify(args)}`);
      listener(args);
    });
  }

  get id() {
    return this.socket.id;
  }
}

class SocketGlobal {
  private global: socketio.Server;
  constructor(global: socketio.Server) {
    this.global = global;
  }

  emit(event: string, ...args: any[]) {
    console.log(`[EMIT] GLOBAL ${event} ${JSON.stringify(args)}`);
    this.global.emit(event, args);
  }
}

export class Room {
  public master: string;
  public members: Socket[];
  public split: number;
  public pattern: number;
  constructor(master: string, pattern: number, split: number) {
    this.master = master;
    this.pattern = pattern;
    this.split = split;
    this.members = [];
  }

  addMember(s: Socket) {
    this.members.push(s);
  }

  removeMember(s: Socket) {
    const i = this.members.findIndex(m => m.id === s.id);
    this.members.splice(i, 1);
  }

  broadcast(event: string, args?: any, exclude?: Socket) {
    this.members.forEach(s => {
      if (exclude !== undefined && s.id === exclude.id)
        return;
      s.emit(event, args);
    });
  }

  get memberList() {
    return this.members.map(s => s.username);
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
  _socket: socketio.Socket, username: string, _global: socketio.Server
): void {
  let currentRoom: string|undefined;
  const socket = new Socket(_socket, username);
  const global = new SocketGlobal(_global);
  socket.on('newRoom', (params) => {
    const { split, pattern } = params;
    rooms[username] = new Room(username, pattern, split);
    rooms[username].addMember(socket);
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
    room.addMember(socket);
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