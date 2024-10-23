<template>
    <v-text-field
        label="OpenAI API Key"
        :value="userSettings.OPENAI_API_KEY"
        @update:model-value="updateUserSettings({ OPENAI_API_KEY: $event })" />
</template>

<script setup lang="ts">
import { useUserSettings } from '~/web/services/user';


const { userSettings, updateUserSettings } = useUserSettings();
</script>
