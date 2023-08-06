<template>
  <div>
    <h1>游戏房间 {{ roomId }}</h1>
    <div v-if="role === 'drawer'">
      <drawing-board :word="word" @drawEvent="handleDrawEvent"></drawing-board>
    </div>
    <div v-else>
      <guessing-board @guessEvent="handleGuessEvent" @chatEvent="handleChatEvent"></guessing-board>
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
  },
};
</script>