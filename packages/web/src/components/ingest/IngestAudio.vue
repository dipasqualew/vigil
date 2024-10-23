<template>
    <div class="audio-recorder">
        <canvas ref="canvas" width="300" height="100"></canvas>
        <v-btn @click="toggleRecording">
            {{ isRecording ? 'Stop Recording' : 'Start Recording' }}
        </v-btn>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';

import { IngestInput, IngestSources } from '~/web/types';


const emit = defineEmits<{
    ingest: [value: IngestInput]
}>();

// State variables
const isRecording = ref(false);
const audioChunks: Blob[] = [];
let audioContext: AudioContext | null = null;
let mediaRecorder: MediaRecorder | null = null;
let analyser: AnalyserNode | null = null;
let dataArray: Uint8Array;
const canvas = ref<HTMLCanvasElement | null>(null);
const canvasContext = computed(() => canvas.value?.getContext('2d') ?? null);
let audioStream: MediaStream | null = null;

const toggleRecording = async () => {
    if (isRecording.value) {
        ingest();
    } else {
        await startRecording();
    }
};

const startRecording = async () => {
    try {
        // Request access to the user's microphone
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Initialize AudioContext and related objects for visualizing the audio
        audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(audioStream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;

        // Create a MediaRecorder to capture audio data
        mediaRecorder = new MediaRecorder(audioStream);
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        mediaRecorder.start();

        // Connect the audio source to the analyser
        source.connect(analyser);
        dataArray = new Uint8Array(analyser.frequencyBinCount);

        // Start visualizing the audio
        isRecording.value = true;
        visualizeAudio();
    } catch (err) {
        console.error('Error accessing the microphone:', err);
    }
};

const ingest = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.onstop = () => {
            // This ensures we handle the final chunk
            const blob = new Blob(audioChunks, { type: 'audio/webm' });
            console.log('Recording stopped:', blob);
            emit('ingest', {
                blob,
                metadata: {
                    usercontentType: blob.type,
                    ingestSource: IngestSources.AUDIO_RECORDING,
                    filename: `${Date.now()}.webm`,
                },
            });
        };
        mediaRecorder.stop();
    }

    // Stop the audio stream
    if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
    }

    // Finalize recording
    isRecording.value = false;
    audioContext?.close();
};

const visualizeAudio = () => {
    if (!analyser || !canvasContext.value) return;

    const draw = () => {
        if (!isRecording.value || !analyser || !canvas.value || !canvasContext.value) return;

        requestAnimationFrame(draw);

        analyser.getByteTimeDomainData(dataArray);
        canvasContext.value.clearRect(0, 0, canvas.value!.width, canvas.value!.height);

        canvasContext.value.lineWidth = 2;
        canvasContext.value.strokeStyle = '#00ccff';

        canvasContext.value.beginPath();

        const sliceWidth = (canvas.value.width * 1.0) / analyser.frequencyBinCount;
        let x = 0;

        for (let i = 0; i < analyser.frequencyBinCount; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * canvas.value!.height) / 2;

            if (i === 0) {
                canvasContext.value.moveTo(x, y);
            } else {
                canvasContext.value.lineTo(x, y);
            }

            x += sliceWidth;
        }

        canvasContext.value.lineTo(canvas.value!.width, canvas.value!.height / 2);
        canvasContext.value.stroke();
    };

    draw();
};

onBeforeUnmount(() => {
    if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
    }
    audioContext?.close();
});
</script>

<style scoped>
.audio-recorder {
    display: flex;
    flex-direction: column;
    align-items: center;
}

canvas {
    border: 1px solid #000;
    margin-bottom: 20px;
}

button {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
}
</style>
