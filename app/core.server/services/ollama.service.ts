import { Ollama } from 'ollama'
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
        this.ollama = new Ollama({ host: 'http://localhost:11434' })
        this.isLoaded = true
    }
    loadData(_: unknown): Promise<unknown> {
        throw new Error('Method not implemented.');
    }

    async fetchFeedbacks(): Promise<unknown> {
        if (!this.isLoaded) {
            throw new ErrorLoadingTooEarly()
        }

        const message = { role: 'user', content: 'Retourne un tableau json de 10 fruits' }
        const response = await this.ollama.chat({
            model: 'mistral',
            messages: [message],
            format: 'json'
        })

        console.log(response)

        return
    }
}