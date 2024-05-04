<script setup lang="ts">
import { ref, toRefs } from 'vue'
import { ParsedVideoLinkGroup, VideoLink } from '../utils/videolinks'
const props = defineProps<{
  selectedVideos: ParsedVideoLinkGroup[]
}>()
const { selectedVideos } = toRefs(props)
// This component keeps track of shown items
// On load, it will fetch all youtube links from playlist urls

const currentVideoLink = ref<VideoLink | null>(null);

const videLinksLeft = new Set<string>();
for (const videoGroup of selectedVideos.value) {
    for (const link of videoGroup.links) {
        videLinksLeft.add(link.id);
    }
}

function getRandomVideo() {
    if (videLinksLeft.size === 0) {
        console.log('No more videos left');
        return;
    }
    const randomIndex = Math.floor(Math.random() * videLinksLeft.size);
    const randomId = Array.from(videLinksLeft)[randomIndex];
    videLinksLeft.delete(randomId);
    currentVideoLink.value = null;
    for (const videoGroup of selectedVideos.value) {
        for (const link of videoGroup.links) {
            if (link.id === randomId) {
                currentVideoLink.value = link;
                break;
            }
        }
        if (currentVideoLink.value) {
            break;
        }
    }
}

getRandomVideo();

</script>

<template>
  <div>
    <h1>Game View</h1>
  </div>
</template>

<style scoped>
</style>