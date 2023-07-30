import { createRouter, createWebHistory } from 'vue-router';
import EnterNickname from '../components/EnterNickname.vue';
import GameLobby from '../components/GameLobby.vue';
import GameRoom from '../components/GameRoom.vue';
import DrawingBoard from '../components/DrawingBoard.vue';
import GuessingBoard from '../components/GuessingBoard.vue';

const routes = [
  { path: '/enter-nickname', component: EnterNickname , name: 'EnterNickname'},
  { path: '/lobby/:nickname', component: GameLobby, name: 'GameLobby' },
  { path: '/room/:roomId', component: GameRoom, name: 'GameRoom' ,props: (route) => ({ roomId: route.params.roomId, nickname: route.params.nickname }),},
  { path: '/room/:roomId/drawing', component: DrawingBoard },
  { path: '/room/:roomId/guessing', component: GuessingBoard },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;