<template>
    <v-container class="content">
        <v-row justify="space-between">
            <v-col cols="9">
                <strong>{{ relativeTime }}</strong>: {{ recordSpecifics.description }}
            </v-col>
            <v-col cols="3">
                <v-dialog max-width="500">
                    <template v-slot:activator="{ props: activatorProps }">
                        <div class="details">
                            <v-icon
                                size="x-small"
                                v-bind="activatorProps"
                                icon="mdi-information" />
                            <v-icon
                                size="x-small"
                                color="red"
                                icon="mdi-delete" />
                        </div>
                    </template>
                    <template v-slot:default="{ isActive }">
                        <v-card :title="media.filename">
                        <v-card-text>
                            <div><strong>UUID</strong>: {{ media.key }}</div>
                            <div><strong>Filename</strong>: {{ media.filename }}</div>
                            <div><strong>Created</strong>: {{ new Date(media.created).toLocaleString() }}</div>
                            <div><strong>Summary</strong>: {{ media.description }}</div>
                            <S3Renderer
                                class="renderer"
                                :signed-url="url"
                                :content-type="media.contentType" />
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn
                                text="Close Source"
                                @click="isActive.value = false"
                            ></v-btn>
                        </v-card-actions>
                        </v-card>
                    </template>
                </v-dialog>
            </v-col>
        </v-row>
        <component :is="recordSpecifics.component" :result="result" />
    </v-container>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import S3Renderer from '~/web/components/usercontent/S3Renderer.vue';
import { ActionTypes } from "~/web/services/actions";
import { ActionResult, Media } from '~/web/services/media';
import { getRelativeTime } from '~/web/utils';

import BaseRecord from './records/BaseRecord.vue';
import FoodRecord from './records/FoodRecord.vue';
import TodoRecord from './records/TodoRecord.vue';


const { result, media } = defineProps<{ result: ActionResult, media: Media }>();

const recordSpecifics = computed(() => {
    switch (result.actionType) {
        case ActionTypes.FOOD_ESTIMATE:
            return {
                description: 'You ate a meal',
                component: FoodRecord,
            };
        case ActionTypes.TODO_CREATE:
            return {
                description: 'You added a todo',
                component: TodoRecord,
            };
        default:
            return {
                description: 'You added a record',
                component: BaseRecord,
            };
    };
});

const relativeTime = computed(() => getRelativeTime(new Date(result.created)));
const url = computed(() => URL.createObjectURL(media.blob));
</script>

<style scoped>
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
