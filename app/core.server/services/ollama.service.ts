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
        const question = "Centre F. Baclesse : Suite à votre intervention, si tout va bien répondez TVB, sinon répondez AID"
        const response = "Je me suis coupé la main, je souffre énormément"
        const system = {
            role: 'system',
            content: 'Tu es un expert de santé qui a plus de vingt ans d\'expérience et qui sait prendre en compte les retours de ses patients afin d\'en tirer des conclusions sur leur état de santé. Je vais te poser des questions et en fonction de la réponse donne moi un indicateur de 0 à 10 sur l\'état de santé du patient au format {"indicateur_de_sante": int}.'
        }
        const prompt = {
            role: 'user',
            content : 'Voici la question posée : "'+question+'", et voici la réponse donnée par le patient : "'+response+'".'
        }
        const output = await this.ollama.chat({
            model: 'mistral',
            messages: [system, prompt],
            format: 'json'
        })

        console.log(output)

        return
    }
}