import { Ollama } from 'ollama-node'
import { injectable } from "inversify";
import { ErrorLoadingTooEarly } from '../errors';

export interface Iollama {
    loadData(data: unknown): Promise<unknown>
    fetchFeedbacks(): Promise<unknown>
}

@injectable()
export class OllamaService implements Iollama {
    ollama: Ollama
    isLoaded = false
    
    constructor() {
        this.ollama = new Ollama()
        this.ollama.setModel('mistral').then(() => {
            this.isLoaded = true
        })

    }
    loadData(_: unknown): Promise<unknown> {
        throw new Error('Method not implemented.');
    }

    async fetchFeedbacks(): Promise<unknown> {
        if (!this.isLoaded) {
            throw new ErrorLoadingTooEarly()
        }

        const output = await this.ollama.generate("Comment se passe ta journee?");
        console.log(output.output)
        return
    }
}