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
    req.body = { data: req.query };
  else
    req.body = { data: req.body };
  next();
});

import * as http from 'http';
const server = new http.Server(app);
import * as socketio from 'socket.io';
const io = socketio(server, { httpCompression: true });

import { makeRoomClient } from './room';
io.sockets.on('connection', socket => {
  console.log('socket connected');
  socket.emit('connected');
  socket.on('auth', async token => {
    const user = await db.collection('user').findOne({ token });
    if (user !== null)
      makeRoomClient(socket, user.username, io);
    else
      socket.emit('authFailed');
  })
});

app.get('/', (req, res) => {
  res.send('Puzzle app API');
});

import { MongoClient, Db } from 'mongodb';
import { userApis } from './user';
let db: Db;
(async () => {
  const dbName = 'puzzle';
  const url = 'mongodb://localhost:27017';
  try {
    let client = await MongoClient.connect(url);
    console.log('Connected to MongoDB');
    db = client.db(dbName);
    userApis(app, db);
  } catch (err) {
    console.log(err.stack);
  }
  
  const PORT = 5000;
  server.listen(PORT, () => {
    console.log(`Listening ${PORT}`);
  });
})();
