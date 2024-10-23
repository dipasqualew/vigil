<script lang="ts" setup>
import { computed } from 'vue';

import { TodoCreateJson__Model } from '~/web/services/actions';
import { ActionResult } from '~/web/services/media';


const { result } = defineProps<{
    result: ActionResult;
}>();

const todo = computed(() => TodoCreateJson__Model.parse(result.value));
</script>

<template>
<div>
    <div style="margin-top: 1rem">
        <span><em>{{ todo.todo }}</em></span>
    </div>
    <div v-if="todo.recommendedDueDate" style="margin-top: 1rem">
        <span>It is recommended that you complete it by {{ todo.recommendedDueDate }}</span>
    </div>
</div>
</template>
