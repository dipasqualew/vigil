<template>
    <div v-if="contentType.startsWith('text')">
        <span>{{ value }}</span>
    </div>
    <div v-else-if="contentType.startsWith('image')">
        <v-img :src="value" />
    </div>
    <div v-else-if="contentType.startsWith('audio')">
        <audio :src="value" controls />
    </div>
    <div v-else>
        Unsupported content type: {{ contentType }}
        <pre>{{ signedUrl }}</pre>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';


const { signedUrl, contentType } = defineProps<{ signedUrl: string, contentType: string }>();

const value = ref<string>('');

onMounted(async () => {
    if (contentType.startsWith('text')) {
        const response = await fetch(signedUrl);
        value.value = await response.text();
    } else {
        value.value = signedUrl;
    }
});
</script>
