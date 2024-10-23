export enum IngestSources {
    TXT_NOTE = "TXT_NOTE",
    FILE_UPLOAD = "FILE_UPLOAD",
    PHOTO = "PHOTO",
    VIDEO_RECORDING = "VIDEO_RECORDING",
    AUDIO_RECORDING = "AUDIO_RECORDING",
}

export interface IngestInput {
    blob: Blob;
    metadata: {
        usercontentType: string;
        ingestSource: IngestSources;
        filename: string;
    };
}
