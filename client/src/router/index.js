import { createRouter, createWebHistory } from 'vue-router';
import EnterNickname from '../components/EnterNickname.vue';
import GameLobby from '../components/GameLobby.vue';
import GameRoom from '../components/GameRoom.vue';

const routes = [
  { path: '/enter-nickname', component: EnterNickname , name: 'EnterNickname'},
  { path: '/lobby/:nickname', component: GameLobby, name: 'GameLobby' },
  { path: '/room/:roomId', component: GameRoom, name: 'GameRoom' ,props: (route) => ({ roomId: route.params.roomId, nickname: route.params.nickname }),},
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;