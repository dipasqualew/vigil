<template>
    <v-container class="content">
        <v-row justify="space-between">
            <v-col cols="9">
                <strong>{{ relativeTime }}</strong>: {{ description }}
            </v-col>
            <v-col cols="3">
                <v-dialog max-width="500">
                    <template v-slot:activator="{ props: activatorProps }">
                        <div class="details">
                            <router-link :to="`/usercontent/${media.key}`">
                                <v-icon size="small" icon="mdi-link" />
                            </router-link>
                            <v-icon size="small" v-bind="activatorProps" icon="mdi-information" />
                            <v-icon size="small" color="red" @click="deleteContent" icon="mdi-delete" />
                        </div>
                    </template>
                    <template v-slot:default="{ isActive }">
                        <v-card :title="media.filename">
                            <v-card-text>
                                <div><strong>Key</strong>: {{ media.key }}</div>
                                <div><strong>Filename</strong>: {{ media.filename }}</div>
                                <div><strong>Created</strong>: {{ new Date(media.created).toLocaleString() }}</div>
                                <div><strong>Summary</strong>: {{ media.description }}</div>
                                <div v-for="result in results" :key="result.key">
                                    <div><strong>Key</strong>: {{ result.key }}</div>
                                    <div><strong>Type</strong>: {{ result.actionType }}</div>
                                    <div>
                                        <pre>{{ result.value }}</pre>
                                    </div>
                                </div>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn text="Close Details" @click="isActive.value = false"></v-btn>
                            </v-card-actions>
                        </v-card>
                    </template>
                </v-dialog>
            </v-col>
        </v-row>
        <S3Renderer class="renderer" :signed-url="url" :content-type="media.contentType" />
    </v-container>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import { IngestSources } from '~/web/types';
import S3Renderer from '~/web/components/usercontent/S3Renderer.vue';
import { ActionResult, Entities, Media, useMediaService } from '~/web/services/media';
import { getRelativeTime } from '~/web/utils';


const { media } = defineProps<{ media: Media, results: ActionResult[] }>();
const router = useRouter();

const description = computed(() => {
    switch (media.source) {
        case IngestSources.TXT_NOTE:
            return 'You wrote a note';
        case IngestSources.FILE_UPLOAD:
            return 'You uploaded a file';
        case IngestSources.PHOTO:
            return 'You took a photo';
        case IngestSources.AUDIO_RECORDING:
            return 'You recorded an audio note';
        default:
            return 'Unknown source';
    }
});

const url = computed(() => URL.createObjectURL(media.blob));

const relativeTime = computed(() => getRelativeTime(new Date(media.created)));

const deleteContent = async () => {
    const mediaService = useMediaService();
    await mediaService.crud.delete(Entities.MEDIA, media.key);
    await router.push("/");
};
</script>

<style scoped>
i {
    padding: 0.75rem;
}

.content {
    border: 1px solid black;
    margin: 1rem;
    padding: 1rem;
}

.details {
    text-align: right;
}

.renderer {
    margin-top: 1rem;
}
</style>
