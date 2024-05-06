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
const playerVolume = ref(100);
const endScreenText = ref("");
const gameStats = ref([] as {title: string, time: number, wrongGuesses: number}[]);
const badEnding = ref(false);

if (localStorage.getItem('difficulty')) {
    difficulty.value = localStorage.getItem('difficulty') as string;
}
if (localStorage.getItem('gameLength')) {
    gameLength.value = localStorage.getItem('gameLength') as string;
}
if (localStorage.getItem('volume')) {
    playerVolume.value = parseInt(localStorage.getItem('volume') as string);
}
watchEffect(() => {
    localStorage.setItem('difficulty', difficulty.value);
    localStorage.setItem('gameLength', gameLength.value);
    localStorage.setItem('volume', playerVolume.value.toString());
});

const difficultyInfo = computed(() => {
    if (difficulty.value === 'easy') {
        return 'Easy: 3 Choices to choose from';
    } else if (difficulty.value === 'medium') {
        return 'Medium: 10 Choices to choose from';
    } else if (difficulty.value === 'hard') {
        return 'Hard: Choose from all available songs';
    } else if (difficulty.value === 'expert') {
        return 'Expert: 3 wrong guesses and you are out!';
    }
    return 'Select difficulty';
});
const gameLengthInfo = computed(() => {
    if (gameLength.value === 'short') {
        return 'Short: 5 songs';
    } else if (gameLength.value === 'medium') {
        return 'Medium: 30 songs';
    } else if (gameLength.value === 'long') {
        return 'Long: All songs';
    }
    return 'Select game length';
});

let scorePaused = ref(true);
const gameStarted = ref(false);

const currentVideoLink = ref<VideoLink | null>(null);
const triedLinks = ref(new Set<string>());
const buffering = ref(false);
const bufferingStart = ref(0);
const wrongGuesses = ref(0);

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
        // if (window.location.host.includes('local') && correctGuesses.value > 0) {
        //     return 0;
        // }
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
    if (["hard", "expert"].includes(difficulty.value)) {
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
        gameStats.value.push({ title: currentVideoLink.value.title, time: elapsedSeconds.value, wrongGuesses: wrongGuesses.value});
    }
    wrongGuesses.value = 0;

    if (songsLeft.value === 0) {
        console.log('No more videos left');
        if (elapsedTimeInterval) {
            clearInterval(elapsedTimeInterval);
        }
        const totalWrongGuesses = gameStats.value.reduce((acc, val) => acc + val.wrongGuesses, 0);
        scorePaused.value = true;
        endScreenText.value = `You guessed ${correctGuesses.value} songs with only ${totalWrongGuesses} wrong guesses!`;
        return;
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

watchEffect(() => {
    console.log('Setting volume', playerVolume.value);
    if (player) {
        player.setVolume(playerVolume.value);
    }
});

const onPlayerReady = (event: any) => {
    console.log('Player ready', event);
    if (playerVolume.value) {
        player.setVolume(playerVolume.value);
    }
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
        bufferingStart.value = Date.now();
        console.log('Video buffering');
        // Get video length
        console.log('Video length', player.getDuration());
        const lastSeek = player.getDuration() - 60;
        const randomSeek = Math.floor(Math.random() * lastSeek);
        player.seekTo(randomSeek)
        scorePaused.value = true;
    }
}

setInterval(() => {
    const bufferingTime = Date.now() - bufferingStart.value;
    if (player && buffering.value && bufferingTime > 10000) {
        bufferingStart.value = Date.now();
        console.log('Buffering for too long, retrying', buffering.value, bufferingTime, bufferingStart.value);
        player.stopVideo();
        player.loadVideoById("");
        setTimeout(() => {
            player.loadVideoById(currentVideoLink.value?.id);
        }, 1000);
    }
}, 1000)

watchEffect(() => {
    if (currentVideoLink.value) {
        if (!player) {
            buffering.value = true;
            bufferingStart.value = Date.now();
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
    if (buffering.value) {
        console.log('Buffering, not accepting clicks');
        return;
    }
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
        wrongGuesses.value++;
        if (difficulty.value == 'expert' && wrongGuesses.value >= 3) {
            badEnding.value = true;
            scorePaused.value = true;
            endScreenText.value = `Too many wrong guesses! Game over! You got to song ${correctGuesses.value + 1}, Game length: ${gameLength.value}`;
        }
    }
}

function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function reloadWindow() {
    if (!endScreenText.value) {
        if (!confirm('Are you sure you want to quit?')) {
            return;
        }
    }
    window.location.reload();
}

function showShareButton() {
      // @ts-ignore
    if (navigator.share) {
        return true;
    }
    return false;

}

function shareResult() {
    navigator.share({
        title: document.title,
        url: new URL(location.pathname, location.origin).href,
        text: `I guessed ${correctGuesses.value} songs with only ${gameStats.value.reduce((acc, val) => acc + val.wrongGuesses, 0)} wrong guesses!`
    });
}

</script>

<template>
  <div>
    <div v-if="!currentVideoLink" id="start-game">
        <h1>Guess the song!</h1>
        <h2>Click on the correct thumbnail. Incorrect guesses add to score counter. Try to get as low as possible!</h2>
        <p>{{ difficultyInfo }}</p>
        <div class="difficulty">
            <button @click="difficulty = 'easy'" :disabled="difficulty == 'easy'">Easy</button>
            <button @click="difficulty = 'medium'" :disabled="difficulty == 'medium'">Medium</button>
            <button @click="difficulty = 'hard'" :disabled="difficulty == 'hard'">Hard</button>
            <button @click="difficulty = 'expert'" :disabled="difficulty == 'expert'">Expert</button>
        </div>
        <p>{{ gameLengthInfo }}</p>
        <div class="game-length">
            <button @click="gameLength = 'short'" :disabled="gameLength == 'short'">Short</button>
            <button @click="gameLength = 'medium'" :disabled="gameLength == 'medium'">Medium</button>
            <button @click="gameLength = 'long'" :disabled="gameLength == 'long'">Long</button>
        </div>
        <button id="start-button" @click="getRandomVideo">Start</button>
        <p>Change log</p>
        <ul>
            <li>06-05-2024 Added Expert mode</li>
            <li>06-05-2024 Added retry after 10 seconds of buffering</li>
            <li>05-05-2024 Added missing songs. Edited Lappi and All the works... to one song</li>
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
            <span style="font-size: 10px">Controls (click to show):</span>
            <div id="yt-wrapper">
                <div id="yt-frame"></div>
            </div>
            <input id="volume-slider" type="range" min="0" max="100" step="1" v-model="playerVolume" />
        </div>
    </div>
    <div v-if="currentVideoLink" class="choices">
        <div v-for="videoGroup in videoChoices" :key="videoGroup.title">
            <h2 style="text-align: center;">{{ videoGroup.title }}</h2>
            <div class="group-wrapper">
                <div v-for="link in videoGroup.links.filter(l => (videLinksLeft.has(l.id)) || currentVideoLink?.id == l.id)" @click="selectVideo(link)" :key="link.id" class="group-item" :style="`background-image: url('${link.thumbnail}')`">
                    <div class="thumbnail-overlay" v-if="!triedLinks.has(link.id)">
                        <p>{{ link.title }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <button class="big-button" @click="reloadWindow">Quit</button>
    <div v-if="success" id="success-overlay"><p>Correct!</p><p>{{ currentVideoLink?.title }}</p></div>
    <div v-if="success === false" id="failed-overlay">Incorrect! +10<span v-if="difficulty == 'expert'" style="margin-left: 0.5rem;">({{ 3 - wrongGuesses }} guess{{ ((3 - wrongGuesses) > 1) ? 'es' : '' }} left)</span></div>
    <div v-if="endScreenText" id="end-overlay" :class="{'bad-ending': badEnding}">
        <p v-if="!badEnding">Finished!</p>
        <p>{{ endScreenText }}</p>
        <p>Score: {{ elapsedSeconds }} (smaller is better)</p>
        <p>Difficulty: {{ capitalizeFirstLetter(difficulty) }}, Game length: {{ capitalizeFirstLetter(gameLength) }}</p>
        <button class="big-button" @click="reloadWindow">Restart</button>
        <button class="big-button" v-if="showShareButton()" @click="shareResult">Share</button>
    </div>
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
    margin-top: 5rem;
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

}

.group-item:hover {
    cursor: pointer;
}
.thumbnail-overlay {
    font-size: 1.5rem;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    width: 100%;
    height: 100%;
    padding: 0.5rem;
}

@media screen and (max-width: 600px) {
    .group-item {
        height: 26vw;
        width: 26vw;
    }   
    .thumbnail-overlay {
        font-size: 1rem;
    }
    #end-overlay {
        font-size: 2rem !important;
    }
}

#success-overlay, #end-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(24, 79, 36, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 3rem;
    color: white;
    z-index: 100;
    flex-direction: column;
    text-align: center;
}
#end-overlay {
    background-color: rgba(2, 39, 0, 0.8);
}
#end-overlay.bad-ending {
    background-color: rgba(39, 0, 0, 0.8);
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
#start-game {
    max-width: 520px;
}
.difficulty, .game-length {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 1rem;
}
.difficulty > button, .game-length > button {
    flex-grow: 1;
    height: 3rem;
}
.big-button {
    font-size: 2rem;
    padding: 1rem;
    margin: 1rem;
}
html, body {
  overscroll-behavior: none;
}
</style>