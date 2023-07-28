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

app.post('/api/register', (req, res) => {
  const { username, password } = req.body;

  if (users[username]) {
    res.status(400).send('Username already exists');
  } else {
    users[username] = { password };
    res.send('User registered successfully');
  }
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!users[username]) {
    res.status(401).send('Invalid username or password');
  } else if (users[username].password !== password) {
    res.status(401).send('Invalid username or password');
  } else {
    res.send('Logged in successfully');
  }
});

app.post('/api/create-room', (req, res) => {
  const { roomName, creator } = req.body;

  const existingRoom = rooms.find((room) => room.name === roomName);

  if (existingRoom) {
    res.status(409).json({ message: 'room already exists' });
  } else {
    const newRoom = {
      id: rooms.length + 1,
      name: roomName,
      creator,
      players: [creator],
    };
    rooms.push(newRoom);
    res.status(201).json({ message: 'room create successfully', room: newRoom });
  }
});

app.post('/api/join-room', (req, res) => {
  const { roomId, player } = req.body;

  const room = rooms.find((room) => room.id === roomId);

  if (!room) {
    res.status(404).json({ message: 'room not found' });
  } else {
    room.players.push(player);
    res.status(200).json({ message: 'join the room successfully', room });
  }
});

let drawer = null;
let randomWord = null;

wss.on('connection', (ws) => {
  console.log('Client connected');

  if (!drawer) {
    drawer = ws;
    console.log('Sending role data: drawer');
    ws.send(JSON.stringify({ type: 'role', role: 'drawer' }));
    console.log('Role data sent');

    const randomWord = getRandomWord();
    console.log(`Sending word data: ${randomWord}`);
    ws.send(JSON.stringify({ type: 'word', word: randomWord }));
    console.log('Word data sent');
  } else {
    console.log('Sending role data: guesser');
    ws.send(JSON.stringify({ type: 'role', role: 'guesser' }));
    console.log('Role data sent');
  }

  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    const data = JSON.parse(message);

    if (data.type === 'draw') {
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    } else if (data.type === 'guess') {
      const isCorrect = data.guess === randomWord;
      ws.send(JSON.stringify({ type: 'guessResult', isCorrect }));
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