<script setup lang="ts">
import * as Sentry from '@sentry/vue';
import { v4 as uuid4 } from 'uuid';
import { useRouter } from 'vue-router';

import { IngestInput } from '~/web/types';
import IngestAudio from '~/web/components/ingest/IngestAudio.vue';
import IngestFile from "~/web/components/ingest/IngestFile.vue";
import IngestPhoto from '~/web/components/ingest/IngestPhoto.vue';
import IngestText from "~/web/components/ingest/IngestText.vue";
import BasePage from "~/web/components/templates/BasePage.vue";
import { Entities, Media, useMediaService } from '~/web/services/media';

import { getAction } from '~/web/services/actions';
import { useLLM } from '~/web/services/llm';


const { mode } = defineProps<{ mode?: string }>();
const router = useRouter();

const ingestOptions = [
    {
        label: "Write something",
        url: "/ingest/text",
    },
    {
        label: "Upload a file",
        url: "/ingest/file",
    },
    {
        label: "Take a photo",
        url: "/ingest/photo",
    },
    {
        label: "Record an audio note",
        url: "/ingest/audio",
    },
];

const onIngest = async (ingestInput: IngestInput) => {
    Sentry.startSpan({ name: "Ingestion Flow" }, async () => {
        const llm = useLLM();
        const key = uuid4();
        const created = Date.now();
        const mediaService = useMediaService();

        const item: Media = {
            key,
            blob: ingestInput.blob,
            category: mediaService.getMediaCategory(ingestInput.blob.type),
            contentType: ingestInput.blob.type,
            filename: ingestInput.metadata.filename,
            source: ingestInput.metadata.ingestSource,
            created,
            description: "",
        };

        item.description = await llm.interpretation(item);

        await mediaService.crud.put(Entities.MEDIA, key, item);

        const identitied = await llm.identifyActions(item.description);

        for await (const actionType of identitied.actions) {
            const key = uuid4();
            const action = getAction(mediaService, actionType);
            const system = await action.getPrompt(item);
            const results = await llm.query(system, item.description, action.getModel());

            await action.performAction(key, item, results);
        }

        router.push(`/usercontent/${key}`);
    });
};

</script>

<template>
    <BasePage :h1="`Ingest: ${mode || 'select a mode'}`">
        <div v-if="!mode">
            <div v-for="option in ingestOptions" :key="option.url">
                <v-btn class="option" :to="option.url" variant="tonal">
                    {{ option.label }}
                </v-btn>
            </div>
        </div>
        <div v-else-if="mode === 'text'">
            <IngestText @ingest="onIngest" />
        </div>
        <div v-else-if="mode === 'file'">
            <IngestFile @ingest="onIngest" />
        </div>
        <div v-else-if="mode === 'photo'">
            <IngestPhoto @ingest="onIngest" />
        </div>
        <div v-else-if="mode === 'audio'">
            <IngestAudio @ingest="onIngest" />
        </div>
        <div v-else>
            <h2>Invalid mode</h2>
        </div>
    </BasePage>
</template>

<style scoped>
.option {
    margin: 0.25em;
}
</style>
