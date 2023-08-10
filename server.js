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
  const newRoom = {
    id: rooms.length + 1,
    name: `Room ${rooms.length + 1}`,
    creator: nickname,
    players: [{ nickname: nickname, socket: socket, role: 'drawer' }],
  };
  rooms.push(newRoom);

  socket.send(JSON.stringify({ type: 'room_created', roomId: newRoom.id }));

  socket.send(JSON.stringify({ type: 'role_assigned', role: 'drawer' }));

  const randomWord = getRandomWord();
  socket.send(JSON.stringify({ type: 'word_assigned', word: randomWord }));
  newRoom.players[0].word = randomWord;
}

function handleJoinRoom(socket, roomId, nickname) {
 
  const room = rooms.find((room) => room.id === Number(roomId));

  if (room) {
    const existingPlayer = room.players.find((player) => player.nickname === nickname);
    if (existingPlayer) {
    } else {
      const role = 'guesser';
      room.players.push({ nickname: nickname, socket: socket, role: role });

      socket.send(JSON.stringify({ type: 'room_joined', roomId: roomId }));

      socket.send(JSON.stringify({ type: 'role_assigned', role: role }));
      if (role === 'drawer') {
        randomWord = getRandomWord();
        socket.send(JSON.stringify({ type: 'word_assigned', word: randomWord }));
      }
    }
  } else {
    socket.send(JSON.stringify({ type: 'room_join_failed', message: '房间不存在' }));
  }
}

function handleDraw(socket, roomId, x1, y1, x2, y2) {
  const room = rooms.find((room) => room.id === Number(roomId));

  if (room) {
    room.players.forEach((player) => {
      if (player.socket !== socket && player.role === 'guesser' && player.socket.readyState === WebSocket.OPEN) {
        player.socket.send(JSON.stringify({ type: 'draw', x1, y1, x2, y2 }));
      }
    });
  }
}

function handleChat(socket, roomId, message) {
  const room = rooms.find((room) => room.id === Number(roomId));

  if (room) {
    const drawer = room.players.find((player) => player.role === 'drawer');
    const isCorrect = message === drawer.word;

    room.players.forEach((player) => {
      if (player.socket.readyState === WebSocket.OPEN) {
        player.socket.send(JSON.stringify({ type: 'chat', message }));
      }
    });

    if (isCorrect) {
      room.players.forEach((player) => {
        if (player.socket.readyState === WebSocket.OPEN) {
          player.socket.send(JSON.stringify({ type: 'chat', message: '猜对了' }));
        }
      });
      startNewRound(room);
    }
  }
}

function startNewRound(room) {
  room.players.forEach((player) => {
    if (player.socket.readyState === WebSocket.OPEN) {
      player.socket.send(JSON.stringify({ type: 'clear_canvas' }));
    }
  });

  const drawerIndex = room.players.findIndex((player) => player.role === 'drawer');
  room.players[drawerIndex].role = 'guesser';

  const newDrawerIndex = (drawerIndex + 1) % room.players.length;
  room.players[newDrawerIndex].role = 'drawer';

  const randomWord = getRandomWord();
  room.players[newDrawerIndex].socket.send(JSON.stringify({ type: 'word_assigned', word: randomWord }));
  room.players[newDrawerIndex].word = randomWord;

  room.players.forEach((player) => {
    if (player.socket.readyState === WebSocket.OPEN) {
      player.socket.send(JSON.stringify({ type: 'role_assigned', role: player.role }));
    }
  });
}


wss.on('connection', (ws) => {
  console.log('Client connected');

  let drawer = null;


  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    const data = JSON.parse(message);

    switch (data.type) {
      case 'set_nickname':
        console.log(`Received nickname: ${data.nickname}`);
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
        handleDraw(ws, data.roomId, data.x1, data.y1, data.x2, data.y2);
        break;
      case 'chat':
        handleChat(ws, data.roomId, data.message);
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