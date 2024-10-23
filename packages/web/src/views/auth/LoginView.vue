<script setup lang="ts">
import { ref } from 'vue';

import BasePage from "~/web/components/templates/BasePage.vue";
import { authFlow, authenticatedUser } from "~/web/services/user";


const email = ref("");
const password = ref("");
const askForNewPassword = ref(false);
const newPassword = ref("");

let newPasswordPromise: (value: string) => void;

const onNewPassword = (): Promise<string> => {
    askForNewPassword.value = true;

    return new Promise((resolve) => {
        newPasswordPromise = resolve;
    });
};

const setNewPassword = () => {
    if (!newPasswordPromise) {
        return;
    }

    newPasswordPromise(newPassword.value);
    askForNewPassword.value = false;
    newPassword.value = "";
};

const login = async () => {
    if (!email.value || !password.value) {
        return;
    }

    try {
        authenticatedUser.value = await authFlow(email.value, password.value, onNewPassword);
        console.log(authenticatedUser.value);
        email.value = "";
        password.value = "";
    } catch (e) {
        console.error(e);
    }
};


</script>

<template>
    <BasePage h1="Login">
        <div v-if="authenticatedUser">
            <h2>Logged in as {{ authenticatedUser.getIdToken().payload.email }}</h2>
        </div>
        <div v-else>
            <div v-if="askForNewPassword">
                <h2>Set New Password</h2>
                <v-text-field label="New Password" v-model="newPassword" type="password"></v-text-field>
                <v-btn variant="tonal" @click="setNewPassword">
                    Update Password
                </v-btn>
            </div>
            <div v-else>
                <h2>Login</h2>
                <v-text-field label="Email" v-model="email"></v-text-field>
                <v-text-field label="Password" v-model="password" type="password"></v-text-field>
                <v-btn variant="tonal" @click="login">
                    Login
                </v-btn>
            </div>
        </div>
    </BasePage>
</template>
