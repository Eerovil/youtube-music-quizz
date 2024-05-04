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
        if (elapsedTimeInterval) {
            clearInterval(elapsedTimeInterval);
        }
        alert(`Game over! Your score is ${elapsedSeconds.value} (smaller is better)`);
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
    if (triedLinks.value.has(link.id)) {
        console.log('Already tried this link');
        return;
    }
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
    <button v-if="!currentVideoURL" @click="getRandomVideo">Start</button>
    <iframe id="yt-frame" v-if="currentVideoURL" :src="currentVideoURL" width="1" height="1" frameborder="0" allow="autoplay *; fullscreen *" ></iframe>
    <div v-if="currentVideoURL">
        <p>Score: {{ elapsedSeconds }}</p>
    </div>
    <div v-if="currentVideoURL" class="choices">
        <div v-for="videoGroup in selectedVideos" :key="videoGroup.title">
            <h2>{{ videoGroup.title }}</h2>
            <div class="group-wrapper">
                <div v-for="link in videoGroup.links" @click="selectVideo(link)" :key="link.id" class="group-item" :style="`background-image: url('${link.thumbnail}')`">
                    <div class="thumbnail-overlay" v-if="!triedLinks.has(link.id)">
                        <p>{{ link.title }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-if="success" id="success-overlay">Correct!</div>
    <div v-if="success === false" id="failed-overlay">Incorrect! +10 seconds</div>
  </div>
</template>

<style scoped>
#yt-frame {
    opacity: 0;
}
.choices {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    align-items: center;
    width: 100%;
}
.group-wrapper {
    display: flex;
    flex-wrap: wrap;
}
.group-item {
    margin: 0.5rem;
    height: 10vw;
    width: 10vw;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 0.1rem;
    overflow: hidden;

    background-size: cover;
    background-position: center;

    padding: 0.5rem;
}

.group-item:hover {
    cursor: pointer;
}
.thumbnail-overlay {
    font-size: 1.5rem;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    width: 100%;
    height: 100%;
}

@media screen and (max-width: 600px) {
    .group-item {
        height: 35vw;
        width: 35vw;
    }   
    .thumbnail-overlay {
        font-size: 1.2rem;
    }
}

#success-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 255, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 3rem;
    color: white;
    z-index: 100;
}
#failed-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 50px;
    background-color: rgba(255, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
    color: white;
    z-index: 100;
}
</style>