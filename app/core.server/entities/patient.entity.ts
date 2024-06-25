import { Message } from "./message.entity";

export class Patient {
    
    constructor(
        public id: number,
        public name: string,
        public lastname: string,
        public email: string,
        public address: string,
        public phoneNumber: string,
        public messages: Message[],
    ){}
}
