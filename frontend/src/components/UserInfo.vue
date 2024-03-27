<template>
    <div class="hello">
        <button v-if="(user || {}).id" @click="logout">Log out</button>
        <button v-else @click="login">Log in</button>
    </div>
</template>

<script>
export default {
    name: 'UserInfo',
    props: {},
    computed: {
        user() {
            return this.$store.state.user;
        }
    },
    mounted() {
        this.fetchUser();
    },
    methods: {
        async fetchUser() {
            const response = await fetch('/api/getuser');
            const data = await response.json();
            console.log('User:', data);
            this.$store.commit('setUser', data.user);
            console.log('Logged in as', data.user);
            this.$store.commit('setCsrfToken', data.csrftoken)
        },
        async logout() {
            // POST to /logout
            fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': this.$store.state.csrfToken,
                },
            })
                .then(() => {
                    this.$store.commit('setUser', null);
                });
        },
        login() {
            window.location.href = '/login';
        },
    }
}
</script>

<style scoped>

</style>