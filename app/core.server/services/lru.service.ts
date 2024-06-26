export interface ILruService<T> {
    set(key: string, value: T): void
    get(key: string): T | undefined
}

export class MemoryLruService<T> implements ILruService<T> {
    private cache: Record<string, T> = {}

    set(key: string, value: T): void {
        this.cache[key] = value
    }
    get(key: string): T | undefined {
        return this.cache[key]
    }
    
}