<script setup lang="ts">
import { ref } from 'vue'
import GameView from './GameView.vue'
import { getAllVideoLinks } from '../utils/videolinks'

interface Playlist {
  title: string
  url: string
}

// defined data: selectedVideos
const selectedVideos = ref<Playlist[]>([])
selectedVideos.value = getAllVideoLinks('nightwish') 

</script>

<template>
  <GameView
    :selectedVideos="selectedVideos"
  />
</template>

<style scoped>

</style>
