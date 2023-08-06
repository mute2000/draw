<template>
  <div>
    <canvas ref="canvas"></canvas>
    <div class="chat-window">
      <div v-for="message in chatMessages" :key="message.id">
        {{ message.text }}
      </div>
    </div>
    <div class="chat-input">
      <input v-model="inputMessage" placeholder="输入消息" @keyup.enter="sendMessage" />
      <button @click="sendMessage">发送</button>
    </div>
  </div>
</template>

<script>
import socket from '../websocket';

export default {
  data() {
    return {
      context: null,
      guess: '',
      chatMessages: [],
      inputMessage: '',
    };
  },
  mounted() {
    this.context = this.$refs.canvas.getContext('2d');
    this.$refs.canvas.width = this.$refs.canvas.offsetWidth;
    this.$refs.canvas.height = this.$refs.canvas.offsetHeight;
    socket.addEventListener('message', this.handleSocketMessage);
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

        if (data.type === 'draw') {
          this.drawLine(data.x1, data.y1, data.x2, data.y2);
        } else if (data.type === 'chat') {
          this.handleChatMessage(data.message);
        } else {
          console.log(`Unknown message type: ${data.type}`);
        }
      } else {
        console.log('Received non-Blob data:', event.data);
        const data = JSON.parse(event.data);

        if (data.type === 'draw') {
          this.drawLine(data.x1, data.y1, data.x2, data.y2);
        } else if (data.type === 'chat') {
          this.handleChatMessage(data.message);
        } else {
          console.log(`Unknown message type: ${data.type}`);
        }
      }
    },
    drawLine(x1, y1, x2, y2) {
      this.context.beginPath();
      this.context.moveTo(x1, y1);
      this.context.lineTo(x2, y2);
      this.context.stroke();
    },
    submitGuess() {
      this.$emit('guessEvent', {
        type: 'guess',
        guess: this.guess,
      });

      socket.send(JSON.stringify({ type: 'guess', guess: this.guess }));
    },
    handleChatMessage(message) {
      this.chatMessages.push({ id: Date.now(), text: message });
    },
    handleGuessResult(isCorrect) {
      if (isCorrect) {
        alert('恭喜你，猜对了！');
      } else {
        alert('很遗憾，猜错了。');
      }
    },

    sendMessage() {
      this.$emit('chatEvent', {
        type: 'chat',
        message: this.inputMessage,
      });

      socket.send(JSON.stringify({ type: 'chat', message: this.inputMessage }));
      this.inputMessage = '';
    },
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
</style>