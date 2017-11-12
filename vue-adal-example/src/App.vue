<template>
  <div v-if="isAuthenticated" id="app">
    <img src="./assets/logo.png">
    <router-view/>
    <h2><a href="#" v-on:click.stop="logOut()">Log out</a></h2>
  </div>
</template>

<script>
import authentication from './authentication'
export default {
  name: 'app',
  computed: {
    isAuthenticated() {
      return authentication.isAuthenticated();
    }
  },
  methods: {
    logOut() {
      authentication.signOut();
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
