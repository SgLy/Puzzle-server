"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var game_1 = require("./game");
var Socket = /** @class */ (function () {
    function Socket(socket, username) {
        this.socket = socket;
        this.username = username;
    }
    Socket.prototype.emit = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        console.log("[EMIT] " + this.username + " " + event + " " + JSON.stringify(args));
        this.socket.emit(event, args);
    };
    Socket.prototype.on = function (event, listener) {
        var _this = this;
        this.socket.on(event, function (args) {
            console.log("[ ON ] " + _this.username + " " + event + " " + JSON.stringify(args));
            listener(args);
        });
    };
    Object.defineProperty(Socket.prototype, "id", {
        get: function () {
            return this.socket.id;
        },
        enumerable: true,
        configurable: true
    });
    return Socket;
}());
var SocketGlobal = /** @class */ (function () {
    function SocketGlobal(global) {
        this.global = global;
    }
    SocketGlobal.prototype.emit = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        console.log("[EMIT] GLOBAL " + event + " " + JSON.stringify(args));
        this.global.emit(event, args);
    };
    return SocketGlobal;
}());
var Room = /** @class */ (function () {
    function Room(master, pattern, split) {
        this.master = master;
        this.pattern = pattern;
        this.split = split;
        this.members = [];
    }
    Room.prototype.addMember = function (s) {
        this.members.push(s);
    };
    Room.prototype.removeMember = function (s) {
        var i = this.members.findIndex(function (m) { return m.id === s.id; });
        this.members.splice(i, 1);
    };
    Room.prototype.broadcast = function (event, args, exclude) {
        this.members.forEach(function (s) {
            if (exclude !== undefined && s.id === exclude.id)
                return;
            s.emit(event, args);
        });
    };
    Object.defineProperty(Room.prototype, "memberList", {
        get: function () {
            return this.members.map(function (s) { return s.username; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Room.prototype, "size", {
        get: function () {
            return this.members.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Room.prototype, "detail", {
        get: function () {
            return {
                username: this.master,
                size: this.size,
                pattern: this.pattern,
                split: this.split
            };
        },
        enumerable: true,
        configurable: true
    });
    return Room;
}());
exports.Room = Room;
;
var rooms = {};
function makeRoomClient(_socket, username, _global) {
    var currentRoom;
    var socket = new Socket(_socket, username);
    var global = new SocketGlobal(_global);
    socket.on('newRoom', function (params) {
        var split = params.split, pattern = params.pattern;
        rooms[username] = new Room(username, pattern, split);
        rooms[username].addMember(socket);
        // global.emit('roomList', { username, size: 1, pattern, split });
        global.emit('roomList', {
            rooms: Object.values(rooms).map(function (room) { return room.detail; })
        });
    });
    socket.on('enterRoom', function (master) {
        if (currentRoom !== undefined)
            return;
        currentRoom = master;
        var room = rooms[master];
        room.broadcast('enterRoom', username);
        room.addMember(socket);
        socket.emit('roomMember', {
            members: room.memberList
        });
        global.emit('changeRoom', { room: master, size: room.size });
    });
    socket.on('leaveRoom', function () {
        if (currentRoom === undefined)
            return;
        var room = rooms[currentRoom];
        global.emit('changeRoom', { room: currentRoom, size: room.members.length });
        room.removeMember(socket);
        room.broadcast('leaveRoom', username);
        currentRoom = undefined;
    });
    socket.on('roomList', function () {
        socket.emit('roomList', {
            rooms: Object.values(rooms).map(function (room) { return room.detail; })
        });
    });
    socket.on('startGame', function () {
        rooms[username].broadcast('startGame');
        game_1.gameRoom(rooms[username]);
        delete rooms[username];
        // global.emit('deleteRoom', username);
        global.emit('roomList', {
            rooms: Object.values(rooms).map(function (room) { return room.detail; })
        });
    });
    socket.on('deleteRoom', function () {
        // global.emit('deleteRoom', username);
        rooms[username].broadcast('cancelRoom');
        delete rooms[username];
        global.emit('roomList', {
            rooms: Object.values(rooms).map(function (room) { return room.detail; })
        });
    });
}
exports.makeRoomClient = makeRoomClient;
