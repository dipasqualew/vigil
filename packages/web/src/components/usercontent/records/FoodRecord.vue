<script lang="ts" setup>
import { computed } from 'vue';

import { FoodJson__Model } from '~/web/services/actions';
import { ActionResult } from '~/web/services/media';


const { result } = defineProps<{
    result: ActionResult;
}>();

const food = computed(() => FoodJson__Model.parse(result.value));
</script>

<template>
<div>
    <div style="margin-top: 1rem">
        <span><em>{{ food.mealDescription }}</em></span>
    </div>
    <div style="margin-top: 1rem">
        <span>This meal had <strong>{{ food.calories }} calories</strong>, of which:</span>
        <ul>
            <li>{{ food.fat }}g were fat</li>
            <li>{{ food.carbs }}g were carbohydrates</li>
            <li>{{ food.protein }}g were protein</li>
        </ul>
    </div>
    <div v-if="food.notes" style="margin-top: 1rem">
        <span>{{ food.notes }}</span>
    </div>
</div>
</template>

<style scoped>
ul {
    margin-left: 2rem;
}
</style>
