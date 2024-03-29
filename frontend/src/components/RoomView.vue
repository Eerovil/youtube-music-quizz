<template>
    <div class="hello">
        <h1>{{ title }}</h1>
    </div>
</template>

<script>
export default {
    name: 'RoomView',
    props: {
    },
    data: function() {
    },
    computed: {
        title() {
            return (this.$store.state.room || {}).title;
        },
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