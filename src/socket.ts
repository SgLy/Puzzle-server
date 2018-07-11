import * as socketio from 'socket.io';

export class Socket {
  private socket: socketio.Socket;
  public username: string;
  public currentRoom: Room | undefined;
  constructor(socket: socketio.Socket, username: string) {
    this.socket = socket;
    this.username = username;
    this.currentRoom = undefined;
  }

  emit(event: string, ...args: any[]) {
    const data = args.map(a => JSON.stringify(a)).join(';');
    const msg = `[${(new Date()).toISOString()}] [EMIT] ${this.username} ${event} ${data}`;
    console.log(msg);
    this.socket.emit(event, ...args);
  }

  on(event: string, listener: (...args: any[]) => void) {
    this.socket.listeners(event).forEach(f => {
      // @ts-ignore
      this.socket.removeListener(event, f);
    });
    this.socket.on(event, (...args) => {
      const data = args.map(a => JSON.stringify(a)).join(';');
      const msg = `[${(new Date()).toISOString()}] ON ${this.username} ${event} ${data}`;
      console.log(msg);
      listener(...args);
    });
  }

  get id() {
    return this.socket.id;
  }
}

export class SocketGlobal {
  private global: socketio.Server;
  constructor(global: socketio.Server) {
    this.global = global;
  }

  emit(event: string, ...args: any[]) {
    const data = args.map(a => JSON.stringify(a)).join(';');
    const msg = `[${(new Date()).toISOString()}] EMIT GLOBAL ${event} ${data}`;
    console.log(msg);
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

export interface Rooms {
  [key: string]: Room
};