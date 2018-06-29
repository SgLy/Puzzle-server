"use strict";
exports.__esModule = true;
;
var rooms = {};
;
var socketIdToName = {};
function makeRoomClient(socket, username, global) {
    socketIdToName[socket.id] = username;
    socket.on('newRoom', function () {
        rooms[username] = [socket];
        global.emit('newRoom', username);
    });
    socket.on('enterRoom', function (master) {
        rooms[master].forEach(function (socket) {
            socket.emit('enterRoom', username);
        });
        rooms[master].push(socket);
        socket.emit('roomMember', rooms[master].map(function (s) { return socketIdToName[s.id]; }));
        global.emit('changeRoom', {
            room: master,
            size: rooms[master].length
        });
    });
}
exports.makeRoomClient = makeRoomClient;
