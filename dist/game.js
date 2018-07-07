"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function gameRoom(room) {
    room.gaming = true;
    room.members.forEach(function (s) {
        var username = s.username;
        s.on('pickPiece', function (pieceIndex) {
            room.pieces[username] = parseInt(pieceIndex);
            room.broadcast('pickPiece', { pieceIndex: pieceIndex, username: username }, s);
        });
        s.on('movePieceTo', function (data) {
            var X = data.X, Y = data.Y;
            var pieceIndex = room.pieces[username];
            room.broadcast('movePieceTo', { X: X, Y: Y, username: username, pieceIndex: pieceIndex }, s);
        });
        s.on('rotatePiece', function (data) {
            var pieceIndex = room.pieces[username];
            room.broadcast('rotatePiece', { username: username, pieceIndex: pieceIndex }, s);
        });
        s.on('releasePiece', function () {
            var pieceIndex = room.pieces[username];
            delete room.pieces[username];
            room.broadcast('releasePiece', { username: username, pieceIndex: pieceIndex }, s);
        });
    });
}
exports.gameRoom = gameRoom;
