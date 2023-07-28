<template>
    <div>
      <h2>在线玩家</h2>
      <ul>
        <li v-for="player in onlinePlayers" :key="player.id">{{ player.name }}</li>
      </ul>
  
      <h2>创建游戏房间</h2>
      <button @click="createRoom">创建房间</button>
  
      <h2>游戏房间列表</h2>
      <ul>
        <li v-for="room in rooms" :key="room.id">
          {{ room.name }}
          <button @click="joinRoom(room.id)">加入房间</button>
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        onlinePlayers: [], 
        rooms: [], 
      };
    },
    methods: {
  async createRoom() {
    try {
      const response = await fetch('/api/create-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName: '示例房间', 
          creator: '玩家1', 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('房间创建成功:', data);
      } else {
        const error = await response.json();
        console.error('房间创建失败:', error);
      }
    } catch (error) {
      console.error('请求错误:', error);
    }
  },

  async joinRoom(roomId) {
    try {
      const response = await fetch('/api/join-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId, 
          player: '玩家2',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('加入房间成功:', data);
        // 处理加入房间成功的情况，例如跳转到游戏页面
      } else {
        const error = await response.json();
        console.error('加入房间失败:', error);
        // 处理加入房间失败的情况，例如显示错误消息
      }
    } catch (error) {
      console.error('请求错误:', error);
    }
  },
    },
};   
  </script>