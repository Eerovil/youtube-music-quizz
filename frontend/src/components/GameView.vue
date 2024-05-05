<script setup lang="ts">
import { ref, toRefs, computed, watchEffect } from 'vue'
import type { ParsedVideoLinkGroup, VideoLink } from '../utils/videolinks'
const props = defineProps<{
  selectedVideos: ParsedVideoLinkGroup[]
}>()
const { selectedVideos } = toRefs(props)
// This component keeps track of shown items
// On load, it will fetch all youtube links from playlist urls
const success = ref(null as boolean | null)
const difficulty = ref("easy");
const gameLength = ref("short");
let scorePaused = ref(true);
const gameStarted = ref(false);

const currentVideoLink = ref<VideoLink | null>(null);
const triedLinks = ref(new Set<string>());
const buffering = ref(false);

const elapsedSeconds = ref(0);
let elapsedTimeInterval = null as number | null;

const videLinksLeft = ref(new Set<string>());
const correctGuesses = ref(0);
for (const videoGroup of selectedVideos.value) {
    for (const link of videoGroup.links) {
        videLinksLeft.value.add(link.id);
    }
}

const songsLeft = computed(() => {
    if (gameLength.value == "short") {
        return 4 - correctGuesses.value;
    } else if (gameLength.value == "medium") {
        return 29 - correctGuesses.value;
    } else {
        return videLinksLeft.value.size;
    }
});

const videoChoices = computed(() => {
    const ret = [];
    let items = 0;
    for (const videoGroup of selectedVideos.value) {
        const links = videoGroup.links.filter(l => videLinksLeft.value.has(l.id) || currentVideoLink.value?.id === l.id);
        if (links.length > 0) {
            ret.push({ title: videoGroup.title, links });
            items += links.length;
        }
    }
    if (difficulty.value === "hard") {
        return ret;
    }
    // First remove items from each group until there is only 3 in each group
    for (const group of ret) {
        while (group.links.length > 3) {
            const randomIndex = Math.floor(Math.random() * group.links.length);
            if (!group.links[randomIndex]) {
                continue;
            }
            if (group.links[randomIndex]?.id === currentVideoLink.value?.id) {
                continue;
            }
            group.links.splice(randomIndex, 1);
            items--;
        }
    }
    const toShow = difficulty.value === "easy" ? 3 : 10;
    // Remove random items from each group until only toShow items are left
    while (items > toShow) {
        console.log('Removing random item', toShow, items);
        const randomizedIndexes = Array.from({ length: ret.length }, (_, i) => i).sort(() => Math.random() - 0.5);
        for (const index of randomizedIndexes) {
            const group = ret[index];
            // randomly continue to next group
            if (items <= toShow) {
                break;
            }
            const randomIndex = Math.floor(Math.random() * group.links.length);
            if (!group.links[randomIndex]) {
                continue;
            }
            if (group.links[randomIndex]?.id === currentVideoLink.value?.id) {
                continue;
            }
            group.links.splice(randomIndex, 1);
            items--;
        }
    }
    // Remove empty groups
    return ret.filter(group => group.links.length > 0);
});

function getRandomVideo() {
    gameStarted.value = true;
    if (songsLeft.value === 0) {
        console.log('No more videos left');
        if (elapsedTimeInterval) {
            clearInterval(elapsedTimeInterval);
        }
        alert(`Game over! Your score is ${elapsedSeconds.value} (smaller is better) Difficulty: ${difficulty.value}, Game length: ${gameLength.value}`);
        window.location.reload();
        return;
    }
    triedLinks.value.clear();
    if (!currentVideoLink.value) {
        elapsedSeconds.value = 0;
        if (elapsedTimeInterval) {
            clearInterval(elapsedTimeInterval);
        }
        elapsedTimeInterval = setInterval(() => {
            if (scorePaused.value) {
                return;
            }
            elapsedSeconds.value++;
        }, 1000);
    } else {
        correctGuesses.value++;
    }
    const randomIndex = Math.floor(Math.random() * videLinksLeft.value.size);
    const randomId = Array.from(videLinksLeft.value)[randomIndex];
    videLinksLeft.value.delete(randomId);
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

let player: any = null;
const onPlayerReady = (event: any) => {
    console.log('Player ready', event);
    // play
    event.target.playVideo();
}
const onPlayerStateChange = (event: any) => {
    console.log('Player state change', event);
    if (event.data === 0) {
        console.log('Video ended');
        // Restart video
        setTimeout(() => {
            player.seekTo(0);
        }, 1000);
    }
    if (event.data === 1) {
        buffering.value = false;
        console.log('Video playing');
        success.value = null;
        // Unpause score counter
        scorePaused.value = false;
    }
    if (event.data === 2) {
        console.log('Video paused');
        // Pause score counter
        scorePaused.value = true;
    }
    if (event.data === 3) {
        buffering.value = true;
        console.log('Video buffering');
        // Get video length
        console.log('Video length', player.getDuration());
        const lastSeek = player.getDuration() - 60;
        const randomSeek = Math.floor(Math.random() * lastSeek);
        player.seekTo(randomSeek)
        scorePaused.value = true;
    }
}

watchEffect(() => {
    if (currentVideoLink.value) {
        if (!player) {
            // Disable TS2304 error
            // @ts-ignore
            player = new YT.Player('yt-frame', {
            height: '1500',
            width: '500',
            playerVars: {
                controls: 1,
                disablekb: 1,
                enablejsapi: 1,
                fs: 0,
                iv_load_policy: 3,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
                playsinline: 1,
            },
            videoId: currentVideoLink.value?.id,
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
        } else {
            player.loadVideoById(currentVideoLink.value?.id);
            player.stopVideo();

        }
        console.log('Player created', player);
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
        scorePaused.value = true;
        await new Promise(resolve => setTimeout(resolve, 1000));
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
    <div v-if="!currentVideoLink" id="start-game">
        <h1>Guess the song!</h1>
        <h2>Click on the correct thumbnail. Incorrect guesses add to score counter. Try to get as low as possible!</h2>
        <h2>Click start to begin</h2>
        <div class="difficulty">
            <label for="difficulty">Difficulty:</label>
            <select id="difficulty" v-model="difficulty">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
            </select>
        </div>
        <div class="game-length">
            <label for="game-length">Game length:</label>
            <select id="game-length" v-model="gameLength">
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
            </select>
        </div>
        <button id="start-button" @click="getRandomVideo">Start</button>
        <p>Change log</p>
        <ul>
            <li>05-05-2024 Added visible player (maybe it now works on iOS)</li>
            <li>04-05-2024 Fixed songs not playing sometimes (hopefully)</li>
            <li>04-05-2024 Fixed song counter on long game length</li>
            <li>04-05-2024 Added difficulty and game length settings</li>
        </ul>
    </div>
    <div id="score-overlay" :class="{'scorehidden': !currentVideoLink}">
        <div>
            <p>Score: {{ elapsedSeconds }}</p>
            <p>Songs left: {{ songsLeft + 1 }}</p>
        </div>
        <span v-if="buffering">Buffering...</span>
        <div style="display: flex; flex-direction: column;">
            <span style="font-size: 10px">Controls:</span>
            <div id="yt-wrapper">
                <div id="yt-frame"></div>
            </div>
        </div>
    </div>
    <div v-if="currentVideoLink" class="choices">
        <div v-for="videoGroup in videoChoices" :key="videoGroup.title">
            <h2>{{ videoGroup.title }}</h2>
            <div class="group-wrapper">
                <div v-for="link in videoGroup.links.filter(l => (videLinksLeft.has(l.id)) || currentVideoLink?.id == l.id)" @click="selectVideo(link)" :key="link.id" class="group-item" :style="`background-image: url('${link.thumbnail}')`">
                    <div class="thumbnail-overlay" v-if="!triedLinks.has(link.id)">
                        <p>{{ link.title }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-if="success" id="success-overlay"><p>Correct!</p><p>{{ currentVideoLink?.title }}</p></div>
    <div v-if="success === false" id="failed-overlay">Incorrect! +10</div>
  </div>
</template>

<style scoped>
#start-button {
    font-size: 2rem;
    padding: 1rem;
    margin: 1rem;
}
#yt-wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 80px;
    height: 30px;
    overflow: hidden;

    border: 1px solid grey;
}
#yt-wrapper * {
    opacity: 1;
    position: absolute;
    bottom: -6px;
    left: -20px;
}
.choices {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin-top: 3rem;
}
.group-wrapper {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
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
        height: 26vw;
        width: 26vw;
    }   
    .thumbnail-overlay {
        font-size: 1rem;
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
    flex-direction: column;
    text-align: center;
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
#score-overlay {
    position: fixed;
    top: 0;
    right: 0;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    width: 100%;
    color: white;
    background-color: rgba(0, 0, 0, 0.5);

    display: flex;
    justify-content: space-between;
}
#score-overlay.scorehidden {
    top: -900px;
}
</style>