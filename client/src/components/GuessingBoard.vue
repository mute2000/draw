<template>
  <div>
    <canvas ref="canvas"></canvas>
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
      isDrawer: false,
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
        } else if (data.type === 'clear_canvas') {
          this.clearCanvas();
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
    sendMessage() {
      this.$emit('chatEvent', {
        type: 'chat',
        message: this.inputMessage,
      });

      socket.send(JSON.stringify({ type: 'chat', message: this.inputMessage }));
      this.inputMessage = '';
    },
    clearCanvas() {
      this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    },
  },
};
</script>