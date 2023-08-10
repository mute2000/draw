<template>
  <div>
    <h1>游戏房间 {{ roomId }}</h1>
    <div v-if="role === 'drawer'">
      <drawing-board ref="drawingBoard" :word="word" @drawEvent="handleDrawEvent"></drawing-board>
    </div>
    <div v-else>
      <guessing-board ref="guessingBoard" @guessEvent="handleGuessEvent" @chatEvent="handleChatEvent"></guessing-board>
    </div>
    <div class="container">
      <div class="chat-window">
        <div v-for="(message, index) in chatMessages" :key="index">{{ message.text }}</div>
      </div>
      <div class="chat-input-wrapper" v-if="role === 'guesser'">
        <div class="chat-input">
          <input v-model="inputMessage" placeholder="输入消息" @keyup.enter="sendMessage" />
          <button @click="sendMessage">发送</button>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import socket from '../websocket';
import DrawingBoard from './DrawingBoard.vue';
import GuessingBoard from './GuessingBoard.vue';

export default {
  components: {
    DrawingBoard,
    GuessingBoard,
  },
  data() {
    return {
      roomId: this.$route.params.roomId,
      nickname: this.$route.params.nickname,
      role: '',
      word: '',
      chatMessages: [],
      inputMessage: '',
    };
  },
  created() {
    socket.addEventListener('message', this.handleSocketMessage);

    socket.send(JSON.stringify({ type: 'join_room', roomId: this.roomId, nickname: this.nickname }));
  },
  beforeUnmount() {
    socket.removeEventListener('message', this.handleSocketMessage);
  },
  methods: {
    async handleSocketMessage(event) {
      if (event.data instanceof Blob) {
        console.log('Received raw data:', event.data);
        const text = await event.data.text();
        const data = JSON.parse(text);

        switch (data.type) {
          case 'role_assigned':
            this.role = data.role;
            break;
          case 'word_assigned':
            this.word = data.word;
            break;
          case 'chat':
            this.handleChatMessage(data.message);
            break;
          default:
            console.log(`Unknown message type: ${data.type}`);
        }
      } else {
        console.log('Received non-Blob data:', event.data);
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'role_assigned':
            this.role = data.role;
            break;
          case 'word_assigned':
            this.word = data.word;
            break;
          case 'chat':
            this.handleChatMessage(data.message);
            break;
          case 'clear_canvas':      
            if (this.role === 'drawer') {
              this.$refs.drawingBoard.clearCanvas();
            } else {
            this.$refs.guessingBoard.clearCanvas();
            }
            this.clearChatMessages();
            break;
          default:
            console.log(`Unknown message type: ${data.type}`);
        }
      }
    },
    handleDrawEvent(data) {
      console.log('Received draw event:', data);
      socket.send(
        JSON.stringify({
          type: 'draw',
          roomId: this.roomId,
          x1: data.x1,
          y1: data.y1,
          x2: data.x2,
          y2: data.y2,
        })
      );
    },
    handleGuessEvent(data) {
      console.log('Received guess event:', data);
      socket.send(JSON.stringify({ type: 'guess', roomId: this.roomId, guess: data.guess }));
    },
    handleChatEvent(data) {
      console.log('Received chat event:', data);
      socket.send(JSON.stringify({ type: 'chat', roomId: this.roomId, message: data.message }));
    },
    handleChatMessage(message) {
      this.chatMessages.push({ id: Date.now(), text: message });
      if (message === this.word) {
        this.chatMessages.push({ id: Date.now(), text: '猜对了' });
      }
    },
    sendMessage() {
      if (this.role === 'guesser') {
        this.$emit('chatEvent', {
          type: 'chat',
          message: this.inputMessage,
        });

        socket.send(JSON.stringify({ type: 'chat', roomId: this.roomId, message: this.inputMessage }));
        this.inputMessage = '';
      }
    }
  },
};
</script>

<style>
canvas {
  border: 1px solid black;
  width: 500px;
  height: 300px;
}
.guess-input {
  display: flex;
  margin-top: 10px;
}
.guess-input input {
  flex-grow: 1;
}
.chat-window {
  border: 1px solid black;
  width: 500px;
  height: 200px;
  overflow-y: scroll;
  margin-top: auto;
}
.chat-input-wrapper {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px;
  background-color: #ffffff;
}
.chat-input {
  display: flex;
  margin-top: 10px;
}
.chat-input input {
  flex-grow: 1;
}
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100%;
}
</style>
