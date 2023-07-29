<!-- GameRoom.vue -->
<template>
    <div>
      <h1>游戏房间 {{ roomId }}</h1>
      <div v-if="role === 'drawer'">
        <drawing-board></drawing-board>
      </div>
      <div v-else>
        <guessing-board></guessing-board>
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
      };
    },
    created() {
      socket.addEventListener('message', this.handleSocketMessage);
  
      // 向服务器发送加入房间的请求
      socket.send(JSON.stringify({ type: 'join_room', roomId: this.roomId, nickname: this.nickname }));
    },
    beforeUnmount() {
      socket.removeEventListener('message', this.handleSocketMessage);
    },
    methods: {
      handleSocketMessage(event) {
        const data = JSON.parse(event.data);
  
        switch (data.type) {
          case 'role_assigned':
            // 更新角色属性
            this.role = data.role;
            break;
          default:
            console.log(`Unknown message type: ${data.type}`);
        }
      },
    },
  };
  </script>