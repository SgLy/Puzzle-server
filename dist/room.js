"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Room = /** @class */ (function () {
    function Room(master, pattern, split) {
        this.master = master;
        this.pattern = pattern;
        this.split = split;
        this.members = [];
        this.idToName = {};
    }
    Room.prototype.addMember = function (s, username) {
        this.members.push(s);
        this.idToName[s.id] = username;
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
            var _this = this;
            return this.members.map(function (s) { return _this.idToName[s.id]; });
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
;
var rooms = {};
function makeRoomClient(socket, username, global) {
    var currentRoom;
    socket.on('newRoom', function (params) {
        var split = params.split, pattern = params.pattern;
        rooms[username] = new Room(username, pattern, split);
        rooms[username].addMember(socket, username);
        global.emit('newRoom', { username: username, size: 1, pattern: pattern, split: split });
    });
    socket.on('enterRoom', function (master) {
        if (currentRoom !== undefined)
            return;
        currentRoom = master;
        var room = rooms[master];
        room.broadcast('enterRoom', username);
        room.addMember(socket, username);
        socket.emit('roomMember', room.memberList);
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
        socket.emit('roomList', Object.values(rooms).map(function (room) { return room.detail; }));
    });
    socket.on('startGame', function () {
        rooms[username].broadcast('startGame');
        delete rooms[username];
        global.emit('deleteRoom', username);
    });
    socket.on('deleteRoom', function () {
        global.emit('deleteRoom', username);
        rooms[username].broadcast('cancelRoom');
        delete rooms[username];
    });
}
exports.makeRoomClient = makeRoomClient;
