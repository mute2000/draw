<!-- EnterNickname.vue -->
<template>
    <div>
      <h1>请输入你的游戏昵称</h1>
      <form @submit.prevent="handleSubmit">
        <label for="nickname">昵称：</label>
        <input type="text" id="nickname" v-model="nickname" required />
        <br />
        <button type="submit">进入游戏大厅</button>
      </form>
      <router-link v-if="nickname"  :to="{ name: 'GameLobby', params: { nickname: nickname } }"></router-link>
    </div>
  </template>
  
  <script>
  import socket from '../websocket';

  export default {
    data() {
      return {
        nickname: '',
      };
    },
    created() {
      socket.addEventListener('message', this.handleSocketMessage);
    },
    beforeUnmount() {
      socket.removeEventListener('message', this.handleSocketMessage);
    },
    methods: {
      handleSubmit() {
        console.log('nickname:', this.nickname);
        socket.send(JSON.stringify({ type: 'set_nickname', nickname: this.nickname }));
  
        this.$router.push({ name: 'GameLobby', params: { nickname: this.nickname } });
      },
      handleSocketMessage(event) {
        const data = JSON.parse(event.data);
        console.log('handleSocketMessage', data);
        switch (data.type) {
          case 'nickname_accepted':
            this.$router.push({ name: 'GameLobby', params: { nickname: this.nickname } });
            break;
          case 'nickname_rejected':
            alert('昵称已被占用，请选择其他昵称');
            break;
          default:
            console.log(`Unknown message type: ${data.type}`);
        }
      },
    },
  };
  </script>