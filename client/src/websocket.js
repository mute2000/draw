const socket = new WebSocket('ws://localhost:3000');

socket.addEventListener('open', (event) => {
  console.log('WebSocket connection opened:', event);
});

socket.addEventListener('message', (event) => {
  console.log('WebSocket message received:', event);
});

socket.addEventListener('close', (event) => {
  console.log('WebSocket connection closed:', event);
});

socket.addEventListener('error', (event) => {
  console.log('WebSocket error:', event);
});

export default socket;