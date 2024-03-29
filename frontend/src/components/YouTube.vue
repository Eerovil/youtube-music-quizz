<template>
    <div class="hello">
        <audio
            v-if="audioStream"
            ref="audio"
            :src="(audioStream || {}).url"
            :type="(audioStream || {}).mimeType"
            controls autoplay
        ></audio>
    </div>
</template>

<script>
export default {
    name: 'YouTube',
    props: {
        videoId: String,
    },
    data: function() {
        return {
            audioStream: null,
        }
    },
    computed: {
    },
    mounted() {
        this.getAudioStream();
    },
    methods: {
        async getAudioStream() {
        },
    }
}
</script>

<style scoped>

</style>