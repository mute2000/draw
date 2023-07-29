<template>
  <div id="app">
    <router-link to="/enter-nickname">
      <h1>你画我猜</h1>
    </router-link>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

h1 {
  cursor: pointer;
  color: #42b983;
}
</style>