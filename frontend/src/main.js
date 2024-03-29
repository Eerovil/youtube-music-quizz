import { createApp } from 'vue'
import App from './App.vue'
import { createStore } from 'vuex'

// Create a new store instance.
const store = createStore({
    state() {
        return {
            user: null,
            csfrToken: null,
            room: null,
            rooms: [],
        }
    },
    mutations: {
        setUser(state, user) {
            state.user = user
        },
        setCsrfToken(state, token) {
            state.csrfToken = token
        },
        setRooms(state, rooms) {
            state.rooms = rooms
        },
        setRoom(state, room) {
            state.room = room
        }
    },
    actions: {
        async createRoom({ commit }) {
            const title = prompt('Enter a title for the room');
            const response = await fetch('/api/rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': this.state.csrfToken,
                },
                body: JSON.stringify({
                    title,
                }),
            });
            const data = await response.json();
            commit('setRooms', data.rooms);
        },
        async joinRoom({ commit }, roomID) {
            const response = await fetch(`/api/joinroom`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': this.state.csrfToken,
                },
                body: JSON.stringify({
                    roomID,
                }),
            });
            const data = await response.json();
            commit('setRooms', data.rooms);
        }
    }
});

const app = createApp(App);
app.use(store)
app.mount('#app')

