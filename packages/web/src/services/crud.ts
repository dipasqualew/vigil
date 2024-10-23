

export abstract class Crud<Schema> {
    constructor(public name: string) {}
    abstract get<EntityName extends keyof Schema>(entityName: EntityName, key: string): Promise<Schema[EntityName] | undefined>;
    abstract list<EntityName extends keyof Schema>(entityName: EntityName, query?: Record<string, unknown>): Promise<Schema[EntityName][]>;
    abstract put<EntityName extends keyof Schema>(entityName: EntityName, key: string, entity: Schema[EntityName]): Promise<Schema[EntityName]>;
    abstract delete<EntityName extends keyof Schema>(entityName: EntityName, key: string): Promise<void>;
}

export interface IndexedDbTable {
    name: string;
    indexes?: string[];
}


export class IndexedDBCrud<Schema> extends Crud<Schema> {

    constructor(name: string, protected schema: Record<keyof Schema, IndexedDbTable>) {
        super(name);
    }

    onUpgradeNeeded(event: IDBVersionChangeEvent) {
        const db = (event.target as IDBOpenDBRequest).result;
        const tables: IndexedDbTable[] = Object.values(this.schema);

        for (const table of tables) {
            if (!db.objectStoreNames.contains(table.name)) {
                // Create the object store if it doesn't exist
                const store = db.createObjectStore(table.name);

                if (table.indexes) {
                    for (const index of table.indexes) {
                        store.createIndex(index, index);
                    }
                }
                console.log(`Object store '${table.name}' created`);
            }
        }
    };

    getDb(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.name, 1);

            request.onupgradeneeded = (event) => this.onUpgradeNeeded(event);

            request.onsuccess = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                resolve(db);
            };

            request.onerror = (event) => {
                console.error('Error opening IndexedDB:', event);
                reject(event);
            };
        });
    }

    async get<EntityName extends keyof Schema>(entityName: EntityName, key: string): Promise<Schema[EntityName] | undefined> {
        const db = await this.getDb();
        const transaction = db.transaction(entityName as string, 'readonly');
        const store = transaction.objectStore(entityName as string);

        return new Promise((resolve, reject) => {
            const getRequest = store.get(key);

            getRequest.onsuccess = () => {
                const result = getRequest.result;
                if (result) {
                    console.log('Blob retrieved successfully');
                    resolve(result);
                } else {
                    console.log('No blob found for the given key');
                    resolve(undefined);
                }
            };

            getRequest.onerror = (event) => {
                console.error('Error retrieving the blob:', event);
                reject(event);
            };

        });
    }

    async list<EntityName extends keyof Schema>(entityName: EntityName, query?: Record<string, string>): Promise<Schema[EntityName][]> {
        const db = await this.getDb();
        const transaction = db.transaction(entityName as string, 'readonly');
        const store = transaction.objectStore(entityName as string);
        const [key, value] = query ? Object.entries(query)[0] : [null, null];

        return new Promise((resolve, reject) => {
            const request = key && value
                ? store.index(key).getAll(value)
                : store.getAll();

            request.onsuccess = () => {
                const items = request.result as Schema[EntityName][];
                resolve(items);
            };

            request.onerror = (event) => {
                console.error('Error listing keys:', event);
                reject(event);
            };
        });
    }

    async put<EntityName extends keyof Schema>(entityName: EntityName, key: string, entity: Schema[EntityName]): Promise<Schema[EntityName]> {
        const db = await this.getDb();
        const transaction = db.transaction(entityName as string, 'readwrite');
        const store = transaction.objectStore(entityName as string);

        return new Promise((resolve, reject) => {
            // Store the blob with the given key
            const addRequest = store.put(entity, key);

            addRequest.onsuccess = () => {
                console.log('Blob stored successfully');
                resolve(entity);
            };

            addRequest.onerror = (event) => {
                console.error('Error storing the blob:', event);
                reject(event);
            };
        });
    }

    async delete<EntityName extends keyof Schema>(entityName: EntityName, key: string): Promise<void> {
        const db = await this.getDb();
        const transaction = db.transaction(entityName as string, 'readwrite');
        const store = transaction.objectStore(entityName as string);

        return new Promise((resolve, reject) => {
            const deleteRequest = store.delete(key);

            deleteRequest.onsuccess = () => {
                console.log('Blob deleted successfully');
                resolve();
            };

            deleteRequest.onerror = (event) => {
                console.error('Error deleting the blob:', event);
                reject(event);
            };
        });
    }
}
