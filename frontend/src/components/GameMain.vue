<script setup lang="ts">
import { ref } from 'vue'
import GameView from './GameView.vue'
import { getAllVideoLinks } from '../utils/videolinks'
// must be imported using a type-only import
import type { ParsedVideoLinkGroup } from '../utils/videolinks'

// defined data: selectedVideos
const selectedVideos = ref<ParsedVideoLinkGroup[]>([])
selectedVideos.value = getAllVideoLinks('nightwish') 

</script>

<template>
  <GameView
    :selectedVideos="selectedVideos"
  />
</template>

<style scoped>

</style>
