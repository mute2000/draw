<template>
    <div>
      <canvas ref="canvas"></canvas>
      <div>
      <input v-model="guess" placeholder="请输入您的猜测" />
      <button @click="submitGuess">提交猜测</button>
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
      };
    },
    mounted() {
      this.context = this.$refs.canvas.getContext('2d');
      this.$refs.canvas.width = this.$refs.canvas.offsetWidth;
      this.$refs.canvas.height = this.$refs.canvas.offsetHeight;
    },
    methods: {
      drawLine(x1, y1, x2, y2) {
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.stroke();
      },
      submitGuess() {
      socket.send(JSON.stringify({ type: 'guess', guess: this.guess }));
  },
    },
    created() {
      socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
  
        if (data.type === 'draw') {
          const { x1, y1, x2, y2 } = data;
          this.drawLine(x1, y1, x2, y2);
        }
      });
    },
  };
  </script>
  
  <style>
  canvas {
    border: 1px solid black;
    width: 500px;
    height: 300px;
  }
  </style>