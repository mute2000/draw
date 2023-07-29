<!-- GameLobby.vue -->
<template>
  <div>
    <h1>游戏大厅</h1>
    <ul>
      <li v-for="room in rooms" :key="room.id">
        <button @click="joinRoom(room.id)">加入房间 {{ room.id }}</button>
      </li>
    </ul>
    <button @click="createRoom">创建新房间</button>
  </div>
</template>

<script>
import socket from '../websocket';

export default {
  data() {
    return {
      rooms: [],
      nickname: '',
    };
  },
  created() {
    this.nickname = this.$route.params.nickname;
    socket.addEventListener('message', this.handleSocketMessage);

    // 请求房间列表
    socket.send(JSON.stringify({ type: 'get_rooms' }));
  },
  beforeUnmount() {
    socket.removeEventListener('message', this.handleSocketMessage);
  },
  methods: {
    handleSocketMessage(event) {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'rooms_list':
          this.rooms = data.rooms;
          break;
        default:
          console.log(`Unknown message type: ${data.type}`);
      }
    },
    createRoom() {
      // 处理创建新房间逻辑
      socket.send(JSON.stringify({ type: 'create_room', nickname: this.nickname }));
    },
    joinRoom(roomId) {
      // 处理加入房间逻辑
      socket.send(JSON.stringify({ type: 'join_room', roomId: roomId, nickname: this.nickname }));
    },
  },
};
</script>