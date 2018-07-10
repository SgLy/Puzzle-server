import * as socketio from 'socket.io';
import { gameRoom } from './game';

class Socket {
  private socket: socketio.Socket;
  public username: string;
  public currentRoom: Room | undefined;
  constructor(socket: socketio.Socket, username: string) {
    this.socket = socket;
    this.username = username;
    this.currentRoom = undefined;
  }

  emit(event: string, ...args: any[]) {
  console.log(`[EMIT] ${this.username} ${event} ${args.map(a => JSON.stringify(a))}`);
    this.socket.emit(event, ...args);
  }

  on(event: string, listener: (...args: any[]) => void) {
    this.socket.on(event, (...args) => {
    console.log(`[ ON ] ${this.username} ${event} ${args.map(a => JSON.stringify(a))}`);
      listener(...args);
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
  console.log(`[EMIT] GLOBAL ${event} ${args.map(a => JSON.stringify(a))}`);
    this.global.emit(event, ...args);
  }
}

export class Room {
  public master: string;
  public members: Socket[];
  public gameParam: {
    split: number,
    pattern: number,
    sequence: number[] | undefined,
    rotation: number[] | undefined,
    image: string | undefined
  };
  public gaming: boolean;
  constructor(master: string, pattern: number, split: number) {
    this.master = master;
    this.gameParam = {
      pattern, split,
      sequence: undefined, image: undefined,
      rotation: undefined
    };
    this.members = [];
    this.gaming = false;
  }

  addMember(s: Socket) {
    if (this.contain(s.username))
      return;
    this.members.push(s);
    s.currentRoom = this;
  }

  removeMember(s: Socket) {
    const i = this.members.findIndex(m => m.id === s.id);
    this.members.splice(i, 1);
    s.currentRoom = undefined;
  }

  destroy() {
    this.members.forEach(m => { m.currentRoom = undefined; });
    this.members = [];
  }

  broadcast(event: string, args?: any, exclude?: Socket) {
    this.members.forEach(s => {
      if (exclude !== undefined && s.id === exclude.id)
        return;
      s.emit(event, args);
    });
  }

  contain(username: string) {
    return this.members.findIndex(s => s.username === username) !== -1;
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
      pattern: this.gameParam.pattern,
      split: this.gameParam.split
    }
  }
}

interface Rooms {
  [key: string]: Room
};
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
}
