import * as Sentry from '@sentry/vue';
import { createApp } from 'vue';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

import App from '~/web/App.vue';
import { router } from '~/web/router';


const app = createApp(App);

Sentry.init({
    app,
    dsn: import.meta.env.VITE_WEBSERVICE__SENTRYDSN,
    integrations: [
        // Or omit `router` if you're not using vue-router
        Sentry.browserTracingIntegration({ router }),
    ],
    // Tracing
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
    // tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
    // Profiling
    profilesSampleRate: 1.0, // Profile 100% of the transactions. This value is relative to tracesSampleRate
});

const vuetify = createVuetify({
    components,
    directives,
});

app.use(router);
app.use(vuetify);

Sentry.startSpan({ name: 'Application initialization' }, () => {
    app.mount('#app');
});
