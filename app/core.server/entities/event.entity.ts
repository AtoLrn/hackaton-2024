
export enum EventType {
    CANCEL,
    OPERATION,
    DISEASE
}

export class Event {
     constructor(
        public id: number, 
        public date: Date,
        public type: EventType,
        public operationId?: number,
        public disease?: string,
        public operationDate?: Date 
    ) { }
}

