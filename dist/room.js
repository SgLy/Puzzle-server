"use strict";
exports.__esModule = true;
;
var rooms = {};
;
var socketIdToName = {};
function makeRoomClient(socket, username, global) {
    var currentRoom;
    socketIdToName[socket.id] = username;
    socket.on('newRoom', function (params) {
        var split = params.split, pattern = params.pattern;
        rooms[username] = { master: username, members: [socket], pattern: pattern, split: split };
        global.emit('newRoom', { username: username, size: 1, pattern: pattern, split: split });
    });
    socket.on('enterRoom', function (master) {
        if (currentRoom !== undefined)
            return;
        currentRoom = master;
        rooms[master].members.forEach(function (socket) {
            socket.emit('enterRoom', username);
        });
        rooms[master].members.push(socket);
        socket.emit('roomMember', rooms[master].members.map(function (s) {
            return socketIdToName[s.id];
        }));
        global.emit('changeRoom', {
            room: master, size: rooms[master].members.length
        });
    });
    socket.on('leaveRoom', function () {
        if (currentRoom === undefined)
            return;
        global.emit('changeRoom', {
            room: currentRoom, size: rooms[currentRoom].members.length
        });
        var i = rooms[currentRoom].members.findIndex(function (s) { return s.id === socket.id; });
        rooms[currentRoom].members.splice(i, 1);
        rooms[currentRoom].members.forEach(function (socket) {
            socket.emit('leaveRoom', username);
        });
        currentRoom = undefined;
    });
    socket.on('roomList', function () {
        socket.emit('roomList', Object.values(rooms).map(function (room) { return ({
            username: room.master,
            size: room.members.length,
            pattern: room.pattern,
            split: room.split
        }); }));
    });
    socket.on('startGame', function () {
        rooms[username].members.forEach(function (s) { s.emit('startGame'); });
        delete rooms[username];
        global.emit('deleteRoom', username);
    });
    socket.on('deleteRoom', function () {
        global.emit('deleteRoom', username);
        rooms[username].members.forEach(function (s) {
            s.emit('cancelRoom');
        });
        delete rooms[username];
    });
}
exports.makeRoomClient = makeRoomClient;
