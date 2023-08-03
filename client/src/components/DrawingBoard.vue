<template>
  <div>
    <h2>关键字：{{ word }}</h2>
    <canvas ref="canvas" @pointerdown="startDrawing" @pointermove="draw" @pointerup="stopDrawing"></canvas>
  </div>
</template>

<script>
import socket from '../websocket';

export default {
  data() {
    return {
      drawing: false,
      context: null,
      lastX: 0,
      lastY: 0,
      canvasBounds: null,
      word: '',
    };
  },
  mounted() {
    this.context = this.$refs.canvas.getContext('2d');
    this.$refs.canvas.width = this.$refs.canvas.offsetWidth;
    this.$refs.canvas.height = this.$refs.canvas.offsetHeight;
    this.canvasBounds = this.$refs.canvas.getBoundingClientRect();
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

        if (data.type === 'word_assigned') {
          this.word = data.word;
        } else {
          console.log(`Unknown message type: ${data.type}`);
        }
      } else {
        console.log('Received non-Blob data:', event.data);
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'word_assigned':
            this.word = data.word;
            break;
          default:
            console.log(`Unknown message type: ${data.type}`);
        }
      }
    },
    startDrawing(event) {
      this.drawing = true;
      this.lastX = event.pageX - this.canvasBounds.left;
      this.lastY = event.pageY - this.canvasBounds.top;
    },
    draw(event) {
      if (!this.drawing) return;
      const x = event.pageX - this.canvasBounds.left;
      const y = event.pageY - this.canvasBounds.top;
      this.context.beginPath();
      this.context.moveTo(this.lastX, this.lastY);
      this.context.lineTo(x, y);
      this.context.stroke();

      socket.send(
        JSON.stringify({
          type: 'draw',
          x1: this.lastX,
          y1: this.lastY,
          x2: x,
          y2: y,
        })
      );

      [this.lastX, this.lastY] = [x, y];
    },
    stopDrawing() {
      this.drawing = false;
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
</style>