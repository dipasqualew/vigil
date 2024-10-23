import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router';

import IngestView from '~/web/views/IngestView.vue';
import SettingsView from '~/web/views/SettingsView.vue';
import UserContentView from '~/web/views/UserContentView.vue';
import LoginView from '~/web/views/auth/LoginView.vue';

import TodoView from './views/TodoView.vue';


export const routes: RouteRecordRaw[] = [
    {
        name: '/ingest',
        path: '/ingest/:mode?',
        component: IngestView,
        props: true,
    },
    {
        name: '/usercontent',
        alias: '/',
        path: '/usercontent/:contentUuid?',
        component: UserContentView,
        props: true,
    },
    {
        name: '/todo',
        path: '/todo',
        component: TodoView,
    },
    {
        name: '/auth/login',
        path: '/auth/login',
        component: LoginView,
    },
    {
        name: '/settings',
        path: '/settings',
        component: SettingsView,
    },
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
});
