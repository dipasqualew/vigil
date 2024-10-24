<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

import MediaSummary from "~/web/components/usercontent/MediaSummary.vue";
import ResultContainer from "~/web/components/usercontent/ResultContainer.vue";
import {
    ActionResult,
    Entities,
    Media,
    useMediaService,
} from "~/web/services/media";


const { contentUuid } = defineProps<{ contentUuid?: string }>();

const displayRecords = ref(false);
const entities = ref<{ media: Media; results: ActionResult[] }[]>([]);

const loadContent = async (mediaKey?: string) => {
    const mediaService = useMediaService();
    const items = (
        mediaKey
            ? [await mediaService.crud.get(Entities.MEDIA, mediaKey)]
            : await mediaService.crud.list(Entities.MEDIA)
    )
        .filter((item) => item !== undefined)
        .sort((a, b) => {
            return new Date(b.created).getTime() - new Date(a.created).getTime();
        });

    for (const item of items) {
        const result = await mediaService.crud.list(Entities.ACTION_RESULT, {
            mediaKey: item.key,
        });

        entities.value.push({ media: item, results: result });
    }
};

onMounted(async () => {
    await loadContent(contentUuid);
});

watch(
    () => contentUuid,
    async (newUuid) => {
        entities.value = [];
        await loadContent(newUuid);
    },
);
</script>

<template>
  <v-switch
    v-model="displayRecords"
    :label="displayRecords ? 'Showing Records' : 'Showing Sources'"
  />
  <v-row dense>
    <v-col v-for="entity in entities" :key="entity.media.key">
      <div v-if="displayRecords">
        <div v-for="result in entity.results" :key="result.key">
          <ResultContainer :result="result" :media="entity.media" />
        </div>
      </div>
      <div v-else>
        <MediaSummary :media="entity.media" :results="entity.results" />
      </div>
    </v-col>
  </v-row>
  <v-bottom-navigation>
    <v-btn value="text" to="/ingest/text">
      <v-icon icon="mdi-text" />
      <span>Text</span>
    </v-btn>
    <v-btn value="photo" to="/ingest/photo">
      <v-icon icon="mdi-camera" />
      <span>Photo</span>
    </v-btn>
    <v-btn value="photo" to="/ingest/audio">
      <v-icon icon="mdi-microphone" />
      <span>Audio</span>
    </v-btn>
    <v-btn value="file" to="/ingest/file">
      <v-icon icon="mdi-file" />
      <span>File</span>
    </v-btn>
  </v-bottom-navigation>
</template>

<style scoped>
a {
  text-decoration: none;
  color: inherit;
}
</style>
