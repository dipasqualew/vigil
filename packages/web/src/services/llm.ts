import { OpenAI, toFile } from 'openai';
import { zodResponseFormat } from "openai/helpers/zod";
import { ChatCompletionCreateParams } from 'openai/resources/chat/completions';
import * as zod from 'zod';

import { Media, MediaCategories, MediaService } from "~/web/services/media";

import { ActionTypes } from './actions';
import { useUserSettings } from './user';


export const DEFAULT_EMBEDDING_DIMENSIONS = 1536;
export const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";
export const DEFAULT_MODEL = "gpt-4o-mini";

export const IdentifyActionResponse__Model = zod.object({
    actions: zod.array(zod.nativeEnum(ActionTypes)),
    memory: zod.string().nullable(),
    query: zod.string().nullable(),
});

export type IdentifyActionResponse = zod.infer<typeof IdentifyActionResponse__Model>;

export interface Embedding {
    name: string;
    description: string;
    embeddings: number[];
}

export interface EmbeddingOptions {
    dimensions: number;
    model: string;
}


export abstract class LLM {

    abstract getEmbeddings(
        name: string,
        description: string,
        options?: Partial<EmbeddingOptions>,
    ): Promise<Embedding>;

    abstract query(system: string, content: string): Promise<string>;
    abstract query<T extends zod.AnyZodObject>(
        system: string,
        content: string,
        responseFormat: T,
    ): Promise<zod.infer<T>>;
    abstract query<T extends zod.AnyZodObject>(
        system: string,
        content: string,
        responseFormat?: T,
    ): Promise<string | zod.infer<T>>;

    abstract describeImage(media: Media): Promise<string>;
    abstract describeAudio(media: Media): Promise<string>;

    async interpretation(
        media: Media,
    ): Promise<string> {
        switch (media.category) {
            case MediaCategories.TEXT:
                return await media.blob.text();

            case MediaCategories.IMAGE:
                return this.describeImage(media);

            case MediaCategories.AUDIO:
                return this.describeAudio(media);

            default:
                throw new Error(`Unsupported user content type: ${media.category}`);
        }
    }

    async identifyActions(
        interpretation: string,
    ): Promise<IdentifyActionResponse> {
        const system = `
The user will share some content in the form of text. Your task is to:

1. Match the text content against a series of actions, which I will share with you. You can return multiple actions if they are relevant enough.
2. Let me know if the text is "memorable", something that is very important for the user and their life that should be remembered (and not only just logged. All entries will be logged).
3. You might be later asked to take the action that you identified in step 1. In that case, let me know what information might be useful to share with you (e.g. Past info stored as part of step 2).

The actions are:
* ${ActionTypes.FOOD_ESTIMATE}: estimate calories and nutrients.
* ${ActionTypes.TODO_CREATE}: create a todo.
* ${ActionTypes.TODO_COMPLETE}: mark a todo as done. Match this one if it seems the user completed an action. The application will figure out if a matching todo exists.
* ${ActionTypes.DATAPOINT}: add a generic "data point" (e.g. "Type, blood pressure. Value 120/80").
`;
        return await this.query(system, interpretation, IdentifyActionResponse__Model);
    }
}

export class OpenAILLM extends LLM {
    apiKey: string;
    client: OpenAI;

    constructor(apiKey: string) {
        super();
        this.apiKey = apiKey;
        this.client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    }

    async getEmbeddings(
        name: string,
        description: string,
        options: Partial<EmbeddingOptions> = {},
    ): Promise<Embedding> {
        const mergedOptions = {
            dimensions: DEFAULT_EMBEDDING_DIMENSIONS,
            model: DEFAULT_EMBEDDING_MODEL,
            ...options,
        };

        const embeddings = await this.client.embeddings.create({
            input: description,
            model: mergedOptions.model,
            dimensions: mergedOptions.dimensions,
        });

        console.info({
            message: "LLM Used Tokens",
            model: mergedOptions.model,
            op: "getEmbeddings",
            prompt_tokens: embeddings.usage.prompt_tokens,
            total_tokens: embeddings.usage.total_tokens,
        });

        return { name, description, embeddings: embeddings.data[0].embedding };
    }

    async query(system: string, content: string): Promise<string>;
    async query<T extends zod.AnyZodObject>(
        system: string,
        content: string,
        responseFormat: T,
    ): Promise<zod.infer<T>>;
    async query<T extends zod.AnyZodObject>(
        system: string,
        content: string,
        responseFormat?: T, // Make responseFormat optional
    ): Promise<string | zod.infer<T>> {
        const model = "gpt-4o-mini";
        const query: ChatCompletionCreateParams = {
            model,
            messages: [
                {
                    role: "system",
                    content: system,
                },
                {
                    role: "user",
                    content,
                },
            ],
        };

        if (responseFormat) {
            const response = await this.client.beta.chat.completions.parse({
                ...query,
                response_format: zodResponseFormat(responseFormat, "query"),
            });

            if (response.usage) {
                console.info({
                    message: "LLM Used Tokens",
                    model,
                    op: "query",
                    prompt_tokens: response.usage.prompt_tokens,
                    total_tokens: response.usage.total_tokens,
                });
            }

            if (response.choices[0].message.parsed) {
                return response.choices[0].message.parsed;
            } else {
                throw new Error("Failed to parse response");
            }
        } else {
            const response = await this.client.chat.completions.create(query);

            if (response.usage) {
                console.info({
                    message: "LLM Used Tokens",
                    model,
                    op: "query",
                    prompt_tokens: response.usage.prompt_tokens,
                    total_tokens: response.usage.total_tokens,
                });
            }

            return response.choices[0].message.content || "";
        }
    }

    async describeImage(media: Media): Promise<string> {
        const model = "gpt-4o-mini";
        const base64 = await MediaService.toBase64(media.blob);

        const response = await this.client.chat.completions.create({
            model,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Describe in detail the image below." },
                        { type: "image_url", image_url: { url: base64, detail: "low" } },
                    ],
                },
            ],
        });

        if (response.usage) {
            console.info({
                message: "LLM Used Tokens",
                model,
                op: "describeImage",
                prompt_tokens: response.usage.prompt_tokens,
                total_tokens: response.usage.total_tokens,
            });
        }

        return response.choices[0].message.content || "";
    }

    async describeAudio(media: Media): Promise<string> {
        const model = "whisper-1";
        const file = await toFile(
            media.blob,
            media.filename,
            { type: media.contentType },
        );

        const response = await this.client.audio.transcriptions.create({
            model,
            file,
            language: "en",
        });

        console.info({
            message: "LLM Used Tokens",
            model,
            op: "describeAudio",
            prompt_tokens: 0,
            total_tokens: 0,
        });

        return response.text;
    }
}

export const useLLM = (): LLM => {
    const settings = useUserSettings();

    if (!settings.userSettings.value.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY not set");
    }

    return new OpenAILLM(settings.userSettings.value.OPENAI_API_KEY);
};
