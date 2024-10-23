<script lang="ts" setup>
import { ref } from 'vue';

import { IngestInput, IngestSources } from '~/web/types';


const textInput = ref<string>('');

const emit = defineEmits<{
    ingest: [value: IngestInput]
}>();

const ingest = () => {
    emit('ingest', {
        blob: new Blob([textInput.value], { type: 'text/plain' }),
        metadata: {
            usercontentType: 'text/plain',
            ingestSource: IngestSources.TXT_NOTE,
            filename: "user-note.txt",
        },
    });
};

</script>

<template>
    <div>
        <v-textarea label="Send a zap" placeholder="What's on your mind?" v-model="textInput" />
        <v-btn @click="ingest">Ingest</v-btn>
    </div>
</template>
