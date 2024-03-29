<template>
  <UserInfo/>
  <YouTube
    v-if="$store.state.csrfToken"
  videoId="dQw4w9WgXcQ"/>
</template>

<script>
import UserInfo from './components/UserInfo.vue'
import YouTube from './components/YouTube.vue'

export default {
  name: 'App',
  components: {
    UserInfo,
    YouTube
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
