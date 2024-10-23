<template>
    <header>
        <v-toolbar border density="compact">
            <v-toolbar-title><router-link to="/">Vigil</router-link></v-toolbar-title>
            <v-spacer></v-spacer>
            <router-link to="/ingest">
                <v-icon icon="mdi-plus-box" />
            </router-link>

        </v-toolbar>
    </header>
    <main>
        <slot />
    </main>
</template>

<style scoped>
main {
    max-width: 1600px;
    width: 100%;
    padding: 2em;
}

a {
    color: inherit;
    text-decoration: none;
}

i {
    padding: 1rem
}
</style>
