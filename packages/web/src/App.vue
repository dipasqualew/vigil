<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from 'vue-router';

import BaseTemplate from "~/web/components/templates/BaseTemplate.vue";
import { authenticatedUser, onLoad } from "~/web/services/user";


const router = useRouter();
const route = useRoute();

onMounted(async () => {
    authenticatedUser.value = await onLoad();

    if (!authenticatedUser.value) {
        if (route.name !== '/auth/login') {
            router.push({ name: '/auth/login' });
        }
    }
});

</script>

<template>
  <BaseTemplate>
    <RouterView />
  </BaseTemplate>
</template>
