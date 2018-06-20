const app = require('express')();
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 204
}));

const server = require('http').Server(app);
const io = require('socket.io')(server);
app.io = io;
io.sockets.on('connection', (socket) => {
  console.log('socket connected');
  socket.emit('connected');
});

app.get('/', (req, res) => {
    res.send('Puzzle app API');
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Listening ${PORT}`);
});