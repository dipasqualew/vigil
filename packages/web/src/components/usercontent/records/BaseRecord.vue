<script lang="ts" setup>
import { ActionResult } from '~/web/services/media';


const { result } = defineProps<{
    result: ActionResult;
}>();
</script>

<template>
<div>
    <div>
        <pre>{{ result.value }}</pre>
    </div>
</div>
</template>
