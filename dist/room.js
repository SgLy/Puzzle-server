"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var game_1 = require("./game");
var socket_1 = require("./socket");
exports.rooms = {};
var roomList = function (rooms) {
    return Object.values(rooms)
        .filter(function (r) { return !r.gaming; })
        .map(function (room) { return room.detail; });
};
function makeRoomClient(_socket, username, _global) {
    var socket = new socket_1.Socket(_socket, username);
    var global = new socket_1.SocketGlobal(_global);
    socket.on('newRoom', function (params) {
        var split = params.split, pattern = params.pattern;
        if (exports.rooms[username] !== undefined) {
            exports.rooms[username].destroy();
            delete exports.rooms[username];
        }
        Object.values(exports.rooms)
            .filter(function (r) { return r.contain(username); })
            .forEach(function (r) { return r.removeMember(socket); });
        exports.rooms[username] = new socket_1.Room(username, pattern, split);
        exports.rooms[username].addMember(socket);
        global.emit('roomList', { rooms: roomList(exports.rooms) });
    });
    socket.on('enterRoom', function (master) {
        if (socket.currentRoom !== undefined) {
            if (exports.rooms[username] !== undefined) {
                exports.rooms[username].destroy();
                delete exports.rooms[username];
            }
            else
                Object.values(exports.rooms)
                    .filter(function (r) { return r.contain(username); })
                    .forEach(function (r) { return r.removeMember(socket); });
        }
        var room = exports.rooms[master];
        room.addMember(socket);
        room.broadcast('roomMember', { members: room.memberList });
        global.emit('roomList', { rooms: roomList(exports.rooms) });
    });
    socket.on('leaveRoom', function () {
        if (socket.currentRoom === undefined)
            return;
        var room = socket.currentRoom;
        room.removeMember(socket);
        global.emit('roomList', { rooms: roomList(exports.rooms) });
        room.broadcast('roomMember', { members: room.memberList });
    });
    socket.on('roomList', function () {
        socket.emit('roomList', { rooms: roomList(exports.rooms) });
    });
    socket.on('startGame', function () {
        exports.rooms[username].broadcast('startGame');
        game_1.gameRoom(exports.rooms[username]);
        global.emit('roomList', { rooms: roomList(exports.rooms) });
    });
    socket.on('deleteRoom', function () {
        exports.rooms[username].broadcast('cancelRoom');
        exports.rooms[username].destroy();
        delete exports.rooms[username];
        global.emit('roomList', { rooms: roomList(exports.rooms) });
    });
    socket.on('disconnect', function () {
        if (socket.currentRoom === undefined)
            return;
        var room = socket.currentRoom;
        if (room.master === socket.username) {
            exports.rooms[username].broadcast('cancelRoom');
            exports.rooms[username].destroy();
            delete exports.rooms[username];
            global.emit('roomList', { rooms: roomList(exports.rooms) });
        }
        else {
            room.removeMember(socket);
            global.emit('roomList', { rooms: roomList(exports.rooms) });
            room.broadcast('roomMember', { members: room.memberList });
        }
    });
}
exports.makeRoomClient = makeRoomClient;
