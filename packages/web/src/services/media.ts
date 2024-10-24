import { IngestSources } from '~/web/types';

import { ActionTypes } from "./actions";
import { Crud, IndexedDBCrud } from './crud';


export enum MediaCategories {
    IMAGE = 'image',
    AUDIO = 'audio',
    VIDEO = 'video',
    TEXT = 'text',
}

export enum Entities {
    MEDIA = 'media',
    ACTION_RESULT = 'action-result',
    TODO = 'todo',
    // FOOD_DESCRIPTION = 'food-description',
    // DATAPOINT = 'datapoint',
}

export interface Media {
    key: string;
    filename: string;
    category: MediaCategories,
    contentType: string;
    source: IngestSources;
    description: string;
    blob: Blob;
    datetime: number;
    created: number;
}

export interface ActionResult {
    key: string;
    mediaKey: string;
    actionType: ActionTypes;
    value: Record<string, string>;
    datetime: number;
    created: number;
}

export interface Todo {
    key: string;
    mediaKey: string;
    description: string;
    done: boolean;
    due: number | null;
    datetime: number;
    created: number;
}

export type Schema = {
    [Entities.MEDIA]: Media;
    [Entities.ACTION_RESULT]: ActionResult;
    [Entities.TODO]: Todo;
    // [Entities.FOOD_DESCRIPTION]: {
    //     key: string;
    //     description: string;
    //     created: number;
    //     calories: number;
    // };
    // [Entities.DATAPOINT]: {
    //     key: string;
    //     created: number;
    //     name: string;
    //     value: string | number;
    // };
};

export class MediaService {

    constructor(public crud: Crud<Schema>) { }

    static getMediaCategory = (contentType: string): MediaCategories => {
        const ending = contentType.split('/')[1];

        if (["txt", "json", "csv", "md", "plain"].includes(ending)) {
            return MediaCategories.TEXT;
        }

        if (["jpg", "jpeg", "png", "gif"].includes(ending)) {
            return MediaCategories.IMAGE;
        }

        if (["mp3", "wav", "flac", "ogg", "webm", "mpeg"].includes(ending)) {
            return MediaCategories.AUDIO;
        }

        throw new Error(`Unsupported file type: '${contentType}'`);
    };

    static toBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            // This event is triggered when the Blob is read as a Base64 string
            reader.onloadend = () => {
                const base64String = reader.result as string;
                resolve(base64String);
            };

            reader.onerror = (error) => {
                reject(error);
            };

            // Read the Blob as a Base64 string
            reader.readAsDataURL(blob);
        });
    }

    getMediaCategory = MediaService.getMediaCategory;
    toBase64 = MediaService.toBase64;
}

export const useMediaService = (): MediaService => {
    const schema = {
        [Entities.MEDIA]: {
            name: Entities.MEDIA,
        },
        [Entities.ACTION_RESULT]: {
            name: Entities.ACTION_RESULT,
            indexes: ["mediaKey", "actionType", "created"],
        },
        [Entities.TODO]: {
            name: Entities.TODO,
            indexes: ["mediaKey", "done", "created"],
        },
    };
    const crud = new IndexedDBCrud<Schema>('media', schema);
    return new MediaService(crud);
};
