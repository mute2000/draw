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
const users = {};
const rooms = [];

function getRandomWord() {
  const index = Math.floor(Math.random() * wordArr.length);
  return wordArr[index];
}

function handleSetNickname(socket, nickname) {  
  if (users[nickname]) {
    socket.send(JSON.stringify({ type: 'nickname_rejected' }));
  } else {
    users[nickname] = { socket: socket };
    socket.send(JSON.stringify({ type: 'nickname_accepted' }));
  }
}

function handleGetRooms(socket) {
  socket.send(JSON.stringify({ type: 'rooms_list', rooms: rooms }));
}

function handleCreateRoom(socket, nickname) {
  // 创建一个新房间并将其添加到房间列表中
  const newRoom = {
    id: rooms.length + 1,
    name: `Room ${rooms.length + 1}`,
    creator: nickname,
    players: [{ nickname: nickname, socket: socket }],
  };
  rooms.push(newRoom);

  // 向客户端发送新房间的ID
  socket.send(JSON.stringify({ type: 'room_created', roomId: newRoom.id }));
}

function handleJoinRoom(socket, roomId, nickname) {
  //将用户添加到指定房间中
  const room = rooms.find((room) => room.id === roomId);

  if (room) {
    room.players.push({ nickname: nickname, socket: socket });

    // 向客户端发送加入房间成功的消息
    socket.send(JSON.stringify({ type: 'room_joined', roomId: roomId }));

    const role = room.players.length === 1 ? 'drawer' : 'guesser';

    // 发送角色分配消息
    socket.send(JSON.stringify({ type: 'role_assigned', role: role }));
  
  } else {
    // 向客户端发送加入房间失败的消息
    socket.send(JSON.stringify({ type: 'room_join_failed', message: '房间不存在' }));
  }
}

let drawer = null;
let randomWord = null;

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    const data = JSON.parse(message);

    switch (data.type) {
      case 'set_nickname':
        handleSetNickname(ws, data.nickname);
        break;
      case 'get_rooms':
      handleGetRooms(ws);
      break;
      case 'create_room':
      handleCreateRoom(ws, data.nickname);
      break;
      case 'join_room':
      handleJoinRoom(ws, data.roomId, data.nickname);
      break;
      case 'draw':
        const randomWord = getRandomWord();
        ws.send(JSON.stringify({ type: 'word', word: randomWord }));
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
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
    if (ws === drawer) {
      drawer = null;
    }
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});

