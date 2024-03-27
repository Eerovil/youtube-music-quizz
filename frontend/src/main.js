import { createApp } from 'vue'
import App from './App.vue'
import { createStore } from 'vuex'

// Create a new store instance.
const store = createStore({
    state() {
        return {
            user: null,
            csfrToken: null,
        }
    },
    mutations: {
        setUser(state, user) {
            state.user = user
        },
        setCsrfToken(state, token) {
            state.csrfToken = token
        },
    },
});

const app = createApp(App);
app.use(store)
app.mount('#app')

