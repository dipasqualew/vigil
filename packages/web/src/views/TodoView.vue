<script setup lang="ts">
import { computed, onMounted, ref, toRaw } from 'vue';

import { Entities, Todo, useMediaService } from '../services/media';


const todos = ref<Todo[]>([]);

const pending = computed(() => todos.value.filter((todo) => !todo.done));
const done = computed(() => todos.value.filter((todo) => todo.done));

onMounted(async () => {
    const mediaService = useMediaService();
    todos.value = (await mediaService.crud.list(Entities.TODO))
        .sort((a, b) => a.created - b.created);
});

const setDone = async (todo: Todo, done: boolean) => {
    todo.done = done;
    await useMediaService().crud.put(Entities.TODO, todo.key, toRaw(todo));
};


</script>

<template>
<div>
    <div v-for="todo in pending" :key="todo.key">
        <v-checkbox
            :label="todo.description"
            v-model="todo.done"
            @update:model-value="setDone(todo, true)" />
    </div>
    <div v-for="todo in done" :key="todo.key">
        <v-checkbox
            :label="todo.description"
            v-model="todo.done"
            @update:model-value="setDone(todo, false)" />
    </div>
</div>
</template>
