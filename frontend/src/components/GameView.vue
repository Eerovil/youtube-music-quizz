<script setup lang="ts">
import { ref, toRefs, computed, watchEffect } from 'vue'
import { ParsedVideoLinkGroup, VideoLink } from '../utils/videolinks'
const props = defineProps<{
  selectedVideos: ParsedVideoLinkGroup[]
}>()
const { selectedVideos } = toRefs(props)
// This component keeps track of shown items
// On load, it will fetch all youtube links from playlist urls
const success = ref(null as boolean | null)
const expandedGroup = ref<string | null>(null);
const currentVideoLink = ref<VideoLink | null>(null);
const triedLinks = ref(new Set<string>());

const elapsedSeconds = ref(0);
let elapsedTimeInterval = null as number | null;

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
    triedLinks.value.clear();
    if (!currentVideoLink.value) {
        elapsedSeconds.value = 0;
        if (elapsedTimeInterval) {
            clearInterval(elapsedTimeInterval);
        }
        elapsedTimeInterval = setInterval(() => {
            elapsedSeconds.value++;
        }, 1000);
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

const currentVideoURL = computed(() => {
    const videoId = currentVideoLink.value?.id;
    if (!videoId) {
        return '';
    }
    // create random start time between 0 and 200 seconds
    const startTime = Math.floor(Math.random() * 200);
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&start=${startTime}&loop=1`;
});


watchEffect(() => {
    if (currentVideoURL.value) {
        console.log('Playing video:', currentVideoLink.value.title);
    }
});

async function selectVideo(link: VideoLink) {
    triedLinks.value.add(link.id);
    if (currentVideoLink.value && link.id === currentVideoLink.value.id) {
        console.log('Correct!');
        success.value = true;
        await new Promise(resolve => setTimeout(resolve, 2000));
        success.value = null;
        getRandomVideo();
    } else {
        console.log('Incorrect! Added 10 to score.');
        elapsedSeconds.value += 10;
        success.value = false;
    }
}

</script>

<template>
  <div>
    <h1>Game View</h1>
    <button v-if="!currentVideoURL" @click="getRandomVideo">Start</button>
    <iframe id="yt-frame" v-if="currentVideoURL" :src="currentVideoURL" width="1" height="1" frameborder="0" allow="autoplay *; fullscreen *" ></iframe>
    <div v-if="currentVideoURL">
        <p>Score: {{ elapsedSeconds }}</p>
        <p v-if="success === true">Correct!</p>
        <p v-if="success === false">Incorrect!</p>
    </div>
    <div v-if="currentVideoURL" class="choices">
        <div v-for="videoGroup in selectedVideos" :key="videoGroup.title">
            <h2 @click="expandedGroup = videoGroup.title">{{ videoGroup.title }}</h2>
            <ul v-if="expandedGroup == videoGroup.title">
                <li v-for="link in videoGroup.links" :key="link.id">
                    <button @click="selectVideo(link)" :disabled="success || triedLinks.has(link.id)">{{ link.title }}</button>
                </li>
            </ul>
        </div>
    </div>
  </div>
</template>

<style scoped>
#yt-frame {
    opacity: 0;
}
</style>