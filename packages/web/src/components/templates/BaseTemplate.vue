<template>
  <v-app>
    <v-app-bar :elevation="1">
      <template v-slot:append>
        <v-app-bar-nav-icon>
          <router-link to="/ingest">
            <v-icon icon="mdi-plus-box" />
          </router-link>
        </v-app-bar-nav-icon>
      </template>
      <v-app-bar-title><router-link to="/">Vigil</router-link></v-app-bar-title>
    </v-app-bar>
    <v-main class="layout">
      <slot />
    </v-main>
  </v-app>
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
  padding: 1rem;
}

.layout {
  padding-top: var(--v-layout-top);
  padding-bottom: calc(var(--v-layout-bottom) + 16px);
}
</style>
