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
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
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
Object.defineProperty(exports, "__esModule", { value: true });
var uuid = require("uuid/v1");
var room_1 = require("./room");
var SORT_ASCENDING = 1, SORT_DESCENDING = -1;
function userApis(app, db) {
    var _this = this;
    var loginRequired = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(req.body.data.token === undefined)) return [3 /*break*/, 1];
                    res.status(403).end();
                    return [3 /*break*/, 3];
                case 1:
                    _a = req.body;
                    return [4 /*yield*/, db.collection('user')
                            .findOne({ token: req.body.data.token })];
                case 2:
                    _a.user = _b.sent();
                    next();
                    _b.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    app.get('/api/user', loginRequired, function (req, res) {
        res.send(req.body.user);
    });
    app.post('/api/login', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var _a, username, password, user, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = req.body.data, username = _a.username, password = _a.password;
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
                    err_1 = _b.sent();
                    console.log(err_1.errmsg);
                    res.json({ status: -1 });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); });
    app.post('/api/register', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var _a, username, password, nickname, r, err_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    _a = req.body.data, username = _a.username, password = _a.password, nickname = _a.nickname;
                    return [4 /*yield*/, db.collection('user').insertOne({
                            username: username, password: password, nickname: nickname
                        })];
                case 1:
                    r = _b.sent();
                    res.json({ status: r.result.ok });
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _b.sent();
                    console.log(err_2.errmsg);
                    res.json({ status: -1 });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    app.post('/api/result', loginRequired, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var _a, pattern, split, time, timestamp, r, err_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    _a = req.body.data, pattern = _a.pattern, split = _a.split, time = _a.time, timestamp = _a.timestamp;
                    timestamp = parseInt(timestamp);
                    if (timestamp < 1e12)
                        timestamp *= 1e3;
                    return [4 /*yield*/, db.collection('result').insertOne({
                            pattern: pattern, split: split, time: time,
                            timestamp: new Date(timestamp),
                            username: req.body.user.username
                        })];
                case 1:
                    r = _b.sent();
                    res.json({ status: r.result.ok });
                    return [3 /*break*/, 3];
                case 2:
                    err_3 = _b.sent();
                    console.log(err_3);
                    res.json({ status: -1 });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    app.get('/api/rank/:pattern/:split', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var result_1, rec, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    ;
                    result_1 = [];
                    return [4 /*yield*/, db.collection('result').aggregate([{
                                $lookup: {
                                    from: 'user',
                                    localField: 'username',
                                    foreignField: 'username',
                                    as: 'user'
                                }
                            }, {
                                $match: {
                                    pattern: parseInt(req.params.pattern),
                                    split: parseInt(req.params.split)
                                }
                            }]).sort({ time: SORT_ASCENDING }).limit(10)];
                case 1:
                    rec = _a.sent();
                    rec.each(function (err, r) {
                        if (err)
                            throw (err);
                        if (r === null) {
                            res.json({
                                status: 1,
                                rank: result_1
                            });
                            return;
                        }
                        result_1.push({
                            time: r.time,
                            username: r.username,
                            timestamp: r.timestamp,
                            nickname: r.user[0].nickname
                        });
                    });
                    return [3 /*break*/, 3];
                case 2:
                    err_4 = _a.sent();
                    console.log(err_4.errmsg);
                    res.json({ status: -1 });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    app.post('/api/gameParam', loginRequired, function (req, res) {
        var room = room_1.rooms[req.body.user.username];
        room.gameParam.image = req.body.data.image;
        room.gameParam.sequence = req.body.data.sequence;
        var socket = room.members.find(function (s) { return s.username === room.master; });
        if (socket)
            room.broadcast('gameParam', undefined, socket);
        res.json({ status: 1 });
    });
    app.get('/api/gameParam', loginRequired, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var username, room;
        return __generator(this, function (_a) {
            username = req.body.user.username;
            room = Object.values(room_1.rooms).find(function (r) { return r.contain(username); });
            if (room === undefined) {
                console.log("[ERR] " + username + " Not in any room");
                res.send('');
            }
            else {
                res.json({
                    status: 1,
                    split: room.gameParam.split,
                    pattern: room.gameParam.pattern,
                    sequence: room.gameParam.sequence,
                    _imageBase64: room.gameParam.image
                });
            }
            return [2 /*return*/];
        });
    }); });
}
exports.userApis = userApis;
