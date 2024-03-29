<template>
  <UserInfo/>
  <RoomView
    v-if="$store.state.room"
  ></RoomView>
  <RoomList
    v-else
  />
</template>

<script>
import UserInfo from './components/UserInfo.vue'
import RoomList from './components/RoomList.vue'
import RoomView from './components/RoomView.vue'

export default {
  name: 'App',
  components: {
    UserInfo,
    RoomList,
    RoomView,
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
