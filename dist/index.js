"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
var express = require("express");
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
var cors = require('cors');
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 204
}));
app.use(function (req, res, next) {
    console.log("[" + (new Date()).toISOString() + "] " + req.method + " " + req.originalUrl);
    if (req.method === 'GET')
        req['data'] = req.query;
    else
        req['data'] = req.body;
    next();
});
var http = require("http");
var server = new http.Server(app);
var socketio = require("socket.io");
var io = socketio(server);
io.sockets.on('connection', function (socket) {
    console.log('socket connected');
    socket.emit('connected');
});
app.get('/', function (req, res) {
    res.send('Puzzle app API');
});
var mongodb_1 = require("mongodb");
var db;
(function () { return __awaiter(_this, void 0, void 0, function () {
    var dbName, url, client, err_1, PORT;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                dbName = 'puzzle';
                url = 'mongodb://localhost:27017';
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, mongodb_1.MongoClient.connect(url)];
            case 2:
                client = _a.sent();
                console.log('Connected to MongoDB');
                db = client.db(dbName);
                return [3 /*break*/, 4];
            case 3:
                err_1 = _a.sent();
                console.log(err_1.stack);
                return [3 /*break*/, 4];
            case 4:
                PORT = 5000;
                server.listen(PORT, function () {
                    console.log("Listening " + PORT);
                });
                return [2 /*return*/];
        }
    });
}); })();
app.use(function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (req.method === 'POST' && req.path === '/api/register') {
                    next();
                    return [2 /*return*/];
                }
                if (req.method === 'POST' && req.path === '/api/login') {
                    next();
                    return [2 /*return*/];
                }
                if (req['data'].token === undefined) {
                    res.status(403).end();
                    return [2 /*return*/];
                }
                _a = req;
                _b = 'user';
                return [4 /*yield*/, db.collection('user')
                        .findOne({ token: req['data'].token })];
            case 1:
                _a[_b] = _c.sent();
                next();
                return [2 /*return*/];
        }
    });
}); });
app.get('/api/user', function (req, res) {
    res.send(req['user']);
});
var uuid = require("uuid/v1");
app.post('/api/login', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var _a, username, password, user, err_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req['data'], username = _a.username, password = _a.password;
                return [4 /*yield*/, db.collection('user').findOne({
                        username: username, password: password
                    })];
            case 1:
                user = _b.sent();
                if (user === null) {
                    res.json({ status: -1 });
                    return [2 /*return*/];
                }
                user.token = uuid();
                _b.label = 2;
            case 2:
                _b.trys.push([2, 4, , 5]);
                return [4 /*yield*/, db.collection('user').findOneAndUpdate({ _id: user._id }, user)];
            case 3:
                _b.sent();
                res.json({ status: 1, token: user.token });
                return [3 /*break*/, 5];
            case 4:
                err_2 = _b.sent();
                console.log(err_2.errmsg);
                res.json({ status: -1 });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.post('/api/register', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var _a, username, password, nickname, r, err_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req['data'], username = _a.username, password = _a.password, nickname = _a.nickname;
                return [4 /*yield*/, db.collection('user').insertOne({
                        username: username, password: password, nickname: nickname
                    })];
            case 1:
                r = _b.sent();
                res.json({ status: r.result.ok });
                return [3 /*break*/, 3];
            case 2:
                err_3 = _b.sent();
                console.log(err_3.errmsg);
                res.json({ status: -1 });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
