"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function gameRoom(room) {
    room.gaming = true;
    room.members.forEach(function (s) {
        var username = s.username;
        s.on('pickPiece', function (pieceIndex) {
            room.broadcast('pickPiece', { pieceIndex: pieceIndex, username: username }, s);
        });
        s.on('movePieceTo', function (data) {
            var X = data.X, Y = data.Y;
            room.broadcast('movePieceTo', { X: X, Y: Y, username: username }, s);
        });
        s.on('rotatePiece', function (data) {
            var pieceIndex = data.pieceIndex, angle = data.angle;
            room.broadcast('rotatePiece', { username: username, pieceIndex: pieceIndex, angle: angle }, s);
        });
        s.on('releasePiece', function () {
            room.broadcast('releasePiece', { username: username }, s);
        });
    });
}
exports.gameRoom = gameRoom;
