"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Socket = /** @class */ (function () {
    function Socket(socket, username) {
        this.socket = socket;
        this.username = username;
        this.currentRoom = undefined;
    }
    Socket.prototype.emit = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var data = args.map(function (a) { return JSON.stringify(a); }).join(';');
        var msg = "[" + (new Date()).toISOString() + "] [EMIT] " + this.username + " " + event + " " + data;
        console.log(msg);
        (_a = this.socket).emit.apply(_a, [event].concat(args));
        var _a;
    };
    Socket.prototype.on = function (event, listener) {
        var _this = this;
        this.socket.off(event);
        this.socket.on(event, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var data = args.map(function (a) { return JSON.stringify(a); }).join(';');
            var msg = "[" + (new Date()).toISOString() + "] ON " + _this.username + " " + event + " " + data;
            console.log(msg);
            listener.apply(void 0, args);
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
exports.Socket = Socket;
var SocketGlobal = /** @class */ (function () {
    function SocketGlobal(global) {
        this.global = global;
    }
    SocketGlobal.prototype.emit = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var data = args.map(function (a) { return JSON.stringify(a); }).join(';');
        var msg = "[" + (new Date()).toISOString() + "] EMIT GLOBAL " + event + " " + data;
        console.log(msg);
        (_a = this.global).emit.apply(_a, [event].concat(args));
        var _a;
    };
    return SocketGlobal;
}());
exports.SocketGlobal = SocketGlobal;
var Room = /** @class */ (function () {
    function Room(master, pattern, split) {
        this.master = master;
        this.gameParam = {
            pattern: pattern, split: split,
            sequence: undefined, image: undefined,
            rotation: undefined
        };
        this.members = [];
        this.gaming = false;
    }
    Room.prototype.addMember = function (s) {
        if (this.contain(s.username))
            return;
        this.members.push(s);
        s.currentRoom = this;
    };
    Room.prototype.removeMember = function (s) {
        var i = this.members.findIndex(function (m) { return m.id === s.id; });
        this.members.splice(i, 1);
        s.currentRoom = undefined;
    };
    Room.prototype.destroy = function () {
        this.members.forEach(function (m) { m.currentRoom = undefined; });
        this.members = [];
    };
    Room.prototype.broadcast = function (event, args, exclude) {
        this.members.forEach(function (s) {
            if (exclude !== undefined && s.id === exclude.id)
                return;
            s.emit(event, args);
        });
    };
    Room.prototype.contain = function (username) {
        return this.members.findIndex(function (s) { return s.username === username; }) !== -1;
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
                pattern: this.gameParam.pattern,
                split: this.gameParam.split
            };
        },
        enumerable: true,
        configurable: true
    });
    return Room;
}());
exports.Room = Room;
;
