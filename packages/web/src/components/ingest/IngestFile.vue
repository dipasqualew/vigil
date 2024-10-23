<script lang="ts" setup>
import { ref } from 'vue';

import { IngestInput, IngestSources } from '~/web/types';


const emit = defineEmits<{
    ingest: [value: IngestInput]
}>();

const fileInput = ref<File | null>(null);

const onFileInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    fileInput.value = target.files?.[0] || null;
};

const ingest = () => {
    if (fileInput.value) {
        const reader = new FileReader();
        reader.onload = () => {
            const blob = new Blob([reader.result as ArrayBuffer], { type: fileInput.value!.type });
            emit('ingest', {
                blob,
                metadata: {
                    usercontentType: fileInput.value!.type,
                    ingestSource: IngestSources.FILE_UPLOAD,
                    filename: fileInput.value!.name,
                },
            });
        };
        reader.readAsArrayBuffer(fileInput.value);
    }
};
</script>

<template>
    <div>
        <input type="file" @change="onFileInputChange" />
        <button @click="ingest">Ingest</button>
    </div>
</template>

<style scoped>
/* Add any component-specific styles here */
</style>
