import { injectable } from 'inversify';
import { v4 as uuidv4 } from 'uuid';

export interface IQueueService<T> {
    create(info: T): string
    get(id: string): T
}

@injectable()
export class MemoryQueueService<T> implements IQueueService<T> {
    private queue: Record<string, T> = {}
    
    create(info: T): string {
        const id = uuidv4()

        this.queue[id] = info

        return id
        
    }
    get(id: string) {
        return this.queue[id]
    }

}