<template>
    <div class="hello">
        <ul>
            <li v-for="room in rooms" :key="room.id">
                <h2>{{ room.title }}</h2>
                <button @click="joinRoom(room.id)">Join</button>
            </li>
        </ul>
        <button @click="createRoom">Create Room</button>
    </div>
</template>

<script>
export default {
    name: 'RoomList',
    props: {
    },
    data: function() {
        return {
        }
    },
    computed: {
        rooms() {
            return this.$store.state.rooms;
        },
    },
    mounted() {
    },
    methods: {
        createRoom() {
            this.$store.dispatch('createRoom');
        },
        joinRoom(roomId) {
            this.$store.dispatch('joinRoom', roomId);
        }
    }
}
</script>

<style scoped>

</style>