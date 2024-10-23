<script setup lang="ts">
const { h1 } = defineProps<{ h1: string }>();
</script>

<template>
  <h1>{{ h1 }}</h1>
  <slot />
</template>
