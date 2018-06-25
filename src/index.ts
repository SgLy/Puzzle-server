import * as express from 'express';
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 204
}));

app.use((req, res, next) => {
  console.log(`[${(new Date()).toISOString()}] ${req.method} ${req.originalUrl}`);
  if (req.method === 'GET')
  req['data'] = req.query;
  else
  req['data'] = req.body;  
  next();
});

import * as http from 'http';
const server = new http.Server(app);
import * as socketio from 'socket.io';
const io = socketio(server);
io.sockets.on('connection', socket => {
  console.log('socket connected');
  socket.emit('connected');
  socket.on('test', data => {
    console.log(data);
  })
});

app.get('/', (req, res) => {
  res.send('Puzzle app API');
});

import { MongoClient, Db } from 'mongodb';
const SORT_ASCENDING = 1, SORT_DESCENDING = -1;
let db: Db;
(async () => {
  const dbName = 'puzzle';
  const url = 'mongodb://localhost:27017';
  try {
    let client = await MongoClient.connect(url);
    console.log('Connected to MongoDB');
    db = client.db(dbName);
  } catch (err) {
    console.log(err.stack);
  }
  
  const PORT = 5000;
  server.listen(PORT, () => {
    console.log(`Listening ${PORT}`);
  });
})();

app.use(async (req, res, next) => {
  if (req.method === 'POST' && req.path === '/api/register') {
    next();
    return;
  }
  if (req.method === 'POST' && req.path === '/api/login') {
    next();
    return;
  }
  if (req['data'].token === undefined) {
    res.status(403).end();
    return;
  }
  req['user'] = await db.collection('user')
  .findOne({ token: req['data'].token });
  next();
});

app.get('/api/user', (req, res) => {
  res.send(req['user']);
});

import * as uuid from 'uuid/v1';
app.post('/api/login', async (req, res) => {
  const { username, password } = req['data'];
  const user = await db.collection('user').findOne({
    username, password
  });
  if (user === null) {
    res.json({ status: -1 });
    return;
  }
  user.token = uuid();
  try {
    await db.collection('user').findOneAndUpdate({ _id: user._id }, user);
    res.json({ status: 1, token: user.token });
  } catch (err) {
    console.log(err.errmsg);
    res.json({ status: -1 });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { username, password, nickname } = req['data'];
    const r = await db.collection('user').insertOne({
      username, password, nickname
    });
    res.json({ status: r.result.ok });
  } catch (err) {
    console.log(err.errmsg);
    res.json({ status: -1 });
  }
});

app.post('/api/result', async (req, res) => {
  try {
    let { pattern, time, date } = req['data'];
    date = parseInt(date);
    if (date < 1e12)
      date *= 1e3;
    const r = await db.collection('result').insertOne({
      pattern, time,
      date: new Date(date),
      username: req['user'].username
    });
    res.json({ status: r.result.ok });
  } catch (err) {
    console.log(err.errmsg);
    res.json({ status: -1 });
  }
});

app.get('/api/rank/:pattern', async (req, res) => {
  try {
    const result = [];
    const rec = await db.collection('result').aggregate([{
      $lookup: {
        from: 'user',
        localField: 'username',
        foreignField: 'username',
        as: 'user'
      }
    }, {
      $match: {
        pattern: parseInt(req.params.pattern)
      }
    }]).sort({ time: SORT_ASCENDING }).limit(10);
    rec.each((err, r) => {
      if (err) throw (err);
      if (r === null) {
        res.json({
          status: 1,
          rank: result
        });
        return;
      }
      result.push({
        time: r.time,
        username: r.username,
        date: r.date,
        nickname: r.user[0].nickname
      });
    });
  } catch (err) {
    console.log(err.errmsg);
    res.json({ status: -1 });
  }
});