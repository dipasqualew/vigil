import * as zod from "zod";

import { ActionResult, Entities, Media, MediaService, Todo } from "./media";


export enum ActionTypes {
    FOOD_ESTIMATE = "FOOD_ESTIMATE",
    TODO_CREATE = "TODO_CREATE",
    TODO_COMPLETE = "TODO_COMPLETE",
    DATAPOINT = "DATAPOINT",
}

export abstract class Action<T extends zod.AnyZodObject> {
    static TYPE: ActionTypes;
    mediaService: MediaService;

    constructor(mediaService: MediaService) {
        this.mediaService = mediaService;
    }

    abstract getModel(): T;

    async store(key: string, media: Media, json: zod.infer<T>): Promise<ActionResult> {
        const now = Date.now();
        const item: ActionResult = {
            key,
            mediaKey: media.key,
            actionType: (this.constructor as typeof Action).TYPE,
            value: json as Record<string, string>,
            created: Date.now(),
            datetime: now,
        };

        await this.mediaService.crud.put(Entities.ACTION_RESULT, key, item);

        return item;
    }

    async _perform(_key: string, _media: Media, _json: zod.infer<T>): Promise<void> {
        // pass;
    }

    async performAction(
        key: string,
        media: Media,
        json: unknown,
    ): Promise<void> {
        const validated = this.getModel().parse(json);

        await this.store(key, media, validated);

        return this._perform(key, media, validated);
    }

    abstract getPrompt(media: Media): Promise<string>;
}

export class FoodAction extends Action<typeof FoodJson__Model> {
    static TYPE = ActionTypes.FOOD_ESTIMATE;

    getModel() {
        return FoodJson__Model;
    }

    async getPrompt(_media: Media): Promise<string> {
        return `
The user will share a detailed description of a food or a meal.

You will need to extract the information, and estimate calories and nutrients.
`;
    }
}

export class TodoCreateAction extends Action<typeof TodoCreateJson__Model> {
    static TYPE = ActionTypes.TODO_CREATE;

    getModel() {
        return TodoCreateJson__Model;
    }

    async getPrompt(_media: Media): Promise<string> {
        return `
The user will share a detailed description of an activity, or todo, or reminder.

You will need to extract the information and create a todo for them.
`;
    }

    async _perform(key: string, media: Media, json: TodoCreateJson): Promise<void> {
        const now = Date.now();
        const item: Todo = {
            key,
            mediaKey: media.key,
            description: json.todo,
            done: false,
            due: null,
            datetime: now,
            created: now,
        };

        await this.mediaService.crud.put(Entities.TODO, key, item);
    }
}

export class TodoCompleteAction extends Action<typeof TodoCompleteJson__Model> {
    static TYPE = ActionTypes.TODO_COMPLETE;

    getModel() {
        return TodoCompleteJson__Model;
    }

    async getPrompt(_media: Media): Promise<string> {
        const pendingTodos = await this.mediaService.crud.list(Entities.TODO, { done: false });
        const descriptions = Object.fromEntries(pendingTodos.map((todo: Todo) => [todo.key, todo.description]));
        return `
The user will share a description of something they just did, such as an activity, a todo or a reminder.

Please select one of the following pending todos:
${JSON.stringify(descriptions, null, 2)}

If none of the entries match, return null for the todoKey instead.
`;
    }

    async _perform(_key: string, _media: Media, json: TodoCompleteJson): Promise<void> {
        if (json.todoKey === null) {
            return;
        }

        const todo = await this.mediaService.crud.get(Entities.TODO, json.todoKey);

        if (!todo) {
            throw new Error(`Todo '${json.todoKey}' not found`);
        }

        todo.done = true;

        await this.mediaService.crud.put(Entities.TODO, json.todoKey, todo);
    }
}

export const FoodJson__Model = zod.object({
    mealDescription: zod.string(),
    calories: zod.number(),
    fat: zod.number(),
    carbs: zod.number(),
    protein: zod.number(),
    notes: zod.string(),
});

export type FoodJson = zod.infer<typeof FoodJson__Model>;

export const TodoCreateJson__Model = zod.object({
    todo: zod.string(),
    recommendedDueDate: zod.string().nullable(),
});

export type TodoCreateJson = zod.infer<typeof TodoCreateJson__Model>;

export const getAction = (mediaService: MediaService, type: ActionTypes): Action<zod.AnyZodObject> => {
    switch (type) {
        case ActionTypes.FOOD_ESTIMATE:
            return new FoodAction(mediaService);

        case ActionTypes.TODO_CREATE:
            return new TodoCreateAction(mediaService);

        case ActionTypes.TODO_COMPLETE:
            return new TodoCompleteAction(mediaService);

        default:
            throw new Error("Unknown action type");
    }
};

export const TodoCompleteJson__Model = zod.object({
    todoKey: zod.string().nullable(),
});

export type TodoCompleteJson = zod.infer<typeof TodoCompleteJson__Model>;
