<template>
  <div id="app">
    <DrawingBoard v-if="role === 'drawer'" :word="word" />
    <GuessingBoard ref="guessingBoard" v-else />
    <UserLogin /> 
    <GameLobby /> 
  </div>
</template>

<script>
import DrawingBoard from './components/DrawingBoard.vue';
import GuessingBoard from './components/GuessingBoard.vue';
import socket from './websocket';
import UserLogin from './components/UserLogin.vue';
import GameLobby from './components/GameLobby.vue';

export default {
  components: {
    DrawingBoard,
    GuessingBoard,
    UserLogin,
    GameLobby,
  },
  data() {
    return {
      word: '',
      guess: '',
      role: '',
    };
  },
  created() {
    socket.addEventListener('message',async (event) => {
      console.log('WebSocket message received:', event);
      const dataString = event.data instanceof Blob ? await event.data.text() : event.data;
      const data = JSON.parse(dataString);

      if (data.type === 'draw') {
      const { x1, y1, x2, y2 } = data;
      this.$refs.guessingBoard.drawLine(x1, y1, x2, y2);
    } else if (data.type === 'role') {
      this.role = data.role;
    } else if (data.type === 'word'){
      this.word = data.word;
    } else{
      console.log('Unknown message type: ' + data.type);
    }
    });
  },
};
</script>