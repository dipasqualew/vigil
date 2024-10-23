<template>
    <div class="video-container">
        <video ref="video" autoplay playsinline></video>
    </div>
    <div class="button-container">
        <v-btn @click="ingest">Take Picture</v-btn>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { IngestInput, IngestSources } from '~/web/types';


const emit = defineEmits<{
    ingest: [value: IngestInput]
}>();

// Define the video ref type as HTMLVideoElement
const video = ref<HTMLVideoElement | null>(null);

const takePicture = (): Promise<Blob | null> => {
    console.log("Requested takePicture");
    return new Promise((resolve) => {
        if (!video.value) {
            resolve(null);
            return;
        }

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
            resolve(null);
            return;
        }

        // Set canvas dimensions to match the video
        canvas.width = video.value.videoWidth;
        canvas.height = video.value.videoHeight;

        // Draw the current frame from the video on the canvas
        context.drawImage(video.value, 0, 0, canvas.width, canvas.height);

        // Convert the canvas to a Blob (asynchronously)
        canvas.toBlob((blob) => {
            console.log("Resolved blob", blob);
            resolve(blob);  // Resolve the promise with the Blob
        }, 'image/png');
    });
};

const ingest = async () => {
    const blob = await takePicture();

    if (!blob) {
        return;
    }

    emit('ingest', {
        blob,
        metadata: {
            usercontentType: blob.type,
            ingestSource: IngestSources.PHOTO,
            filename: `${Date.now()}.png`,
        },
    });
};

onMounted(async () => {
    try {
        // Request access to the user's camera
        const stream: MediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (video.value) {
            // Assign the stream to the video element
            video.value.srcObject = stream;
        }
    } catch (err) {
        console.error("Error accessing the camera: ", err);
    }
});
</script>

<style scoped>
.video-container {
    width: 100%;
    overflow: hidden;
}

.button-container {
    text-align: center;
}

video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    /* Ensures the video fills the div without distortion */
    transform: scaleX(-1);
}
</style>
