<template>
  <v-card>
    <v-toolbar color="transparent">
      <v-toolbar-title class="text-h6">
        <v-toolbar-title-text>{{ relativeTime }}</v-toolbar-title-text>
      </v-toolbar-title>
      <template v-slot:append>
        <v-btn
          color="primary"
          icon="mdi-link"
          :to="`/usercontent/${media.key}`"
        ></v-btn>

        <v-dialog max-width="500">
          <template v-slot:activator="{ props: activatorProps }">
            <v-btn
              color="secondary"
              icon="mdi-information"
              v-bind="activatorProps"
            >
            </v-btn>
          </template>
          <template v-slot:default="{ isActive }">
            <v-card :title="media.filename">
              <v-card-text>
                <div><strong>Key</strong>: {{ media.key }}</div>
                <div><strong>Filename</strong>: {{ media.filename }}</div>
                <div>
                  <strong>Created</strong>:
                  {{ new Date(media.created).toLocaleString() }}
                </div>
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
                <v-btn
                  text="Close Details"
                  @click="isActive.value = false"
                ></v-btn>
              </v-card-actions>
            </v-card> </template
        ></v-dialog>
        <v-btn color="error" icon="mdi-delete" @click="deleteContent"></v-btn>
      </template>
    </v-toolbar>
    <v-card-subtitle>{{ description }}</v-card-subtitle>
    <v-card-text>
      <S3Renderer
        class="renderer"
        :signed-url="url"
        :content-type="media.contentType"
    /></v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useRouter } from "vue-router";

import { IngestSources } from "~/web/types";
import S3Renderer from "~/web/components/usercontent/S3Renderer.vue";
import {
  ActionResult,
  Entities,
  Media,
  useMediaService,
} from "~/web/services/media";
import { getRelativeTime } from "~/web/utils";

const { media } = defineProps<{ media: Media; results: ActionResult[] }>();
const router = useRouter();

const description = computed(() => {
  switch (media.source) {
    case IngestSources.TXT_NOTE:
      return "You wrote a note";
    case IngestSources.FILE_UPLOAD:
      return "You uploaded a file";
    case IngestSources.PHOTO:
      return "You took a photo";
    case IngestSources.AUDIO_RECORDING:
      return "You recorded an audio note";
    default:
      return "Unknown source";
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
