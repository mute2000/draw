const express = require('express');
const app = express();
const server = require('http').createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });
const bodyParser = require('body-parser');

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const wordArr = ['苹果', '香蕉', '橙子', '汽车', '自行车', '电脑', '手机'];
const rooms = [];

function getRandomWord() {
  const index = Math.floor(Math.random() * wordArr.length);
  return wordArr[index];
}

app.post('/api/create-room', (req, res) => {
  const { nickname } = req.body;

  const newRoom = {
    id: rooms.length + 1,
    name: `Room ${rooms.length + 1}`,
    creator: nickname,
    players: [{ nickname: nickname, socket: null }],
  };
  rooms.push(newRoom);
  res.status(201).json({ message: 'room create successfully', room: newRoom });
});

app.post('/api/join-room', (req, res) => {
  const { roomId, nickname } = req.body;

  const room = rooms.find((room) => room.id === roomId);

  if (!room) {
    res.status(404).json({ message: 'room not found' });
  } else {
    room.players.push({ nickname: nickname, socket: null });
    res.status(200).json({ message: 'join the room successfully', room });
  }
});

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    const data = JSON.parse(message);

    switch (data.type) {
      case 'set_nickname':
        handleSetNickname(ws, data.nickname);
        break;
      case 'join_room':
        const joinRoom = rooms.find((room) => room.id === data.roomId);
        if (joinRoom) {
          const player = joinRoom.players.find((player) => player.nickname === data.nickname);
          if (player) {
            player.socket = ws;
          }

          // 分配角色
          const role = joinRoom.players.length === 1 ? 'drawer' : 'guesser';

          // 发送角色分配消息
          ws.send(JSON.stringify({ type: 'role_assigned', role: role }));
        }
        break;
      case 'create_room':
        const newRoom = {
          id: rooms.length + 1,
          name: `Room ${rooms.length + 1}`,
          creator: data.nickname,
          players: [{ nickname: data.nickname, socket: ws }],
        };
        rooms.push(newRoom);
        ws.send(JSON.stringify({ type: 'room_created', roomId: newRoom.id }));
        break;
      case 'draw':
        const drawRoom = rooms.find((room) => room.id === data.roomId);
        if (drawRoom) {
          drawRoom.players.forEach((player) => {
            if (player.socket !== ws && player.socket.readyState === WebSocket.OPEN) {
              player.socket.send(message);
            }
          });
        }
        break;
      case 'guess':
        const isCorrect = data.guess === randomWord;
        ws.send(JSON.stringify({ type: 'guessResult', isCorrect }));
        break;
      default:
        console.log(`Unknown message type: ${data.type}`);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    // 从房间中移除断开连接的客户端
    rooms.forEach((room) => {
      const index = room.players.findIndex((player) => player.socket === ws);
      if (index !== -1) {
        room.players.splice(index, 1);
      }
    });
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});