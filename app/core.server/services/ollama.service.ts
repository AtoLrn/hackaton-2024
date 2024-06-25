import { Ollama } from 'ollama'
import { injectable } from "inversify";
import { ErrorLoadingTooEarly } from '../errors';

export interface Iollama {
    loadData(data: unknown): Promise<unknown>
    fetchHealthIndicatorFromFeedback(): Promise<unknown>
    fetchSatisfactionIndicatorFromFeedback(): Promise<unknown>
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

    async fetchHealthIndicatorFromFeedback(): Promise<unknown> {
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
            content : 'Voici la question posée : "'+question+'"(si la question contient une échelle différente, ignore l\'échelle donnée dans la question ne renvoie qu\'une note de 1 à 10), et voici la réponse donnée par le patient : "'+response+'".'
        }
        const output = await this.ollama.chat({
            model: 'mistral',
            messages: [system, prompt],
            format: 'json'
        })

        const parsedRes = JSON.parse(output.message.content)

        console.log(parsedRes)
        return
    }

    async fetchSatisfactionIndicatorFromFeedback(): Promise<unknown> {
        if (!this.isLoaded) {
            throw new ErrorLoadingTooEarly()
        }
        const question = "Pole de santé du Villeneuvois: évaluez votre prise en charge sur une échelle de 1 à 13 (1: pas satisfait du tout 5: très satisfait) Cette note concerne les soins et les informations transmises par le médecin et l'équipe soignante"
        const response = "très satifait"
        const system = {
            role: 'system',
            content: 'Tu es un personnel d\'hôpital qui s\'occupe des patients. Tu sais prendre en compte les avis des patients sur leur séjour à l\'hôpital et en tirer un indicateur de satisfaction. Je vais te poser des questions et en fonction de la réponse, donne-moi un indicateur de 0 à 10 sur l\'état de satisfaction du patient au format: {"indicateur_de_satisfaction": int}.'
        }
        const prompt = {
            role: 'user',
            content : 'Voici la question posée :  "'+question+'" (si la question contient une échelle différente, ignore l\'échelle donnée dans la question ne renvoie qu\'une note de 1 à 10), et voici la réponse donnée par le patient : "'+response+'".'
        }
        const output = await this.ollama.chat({
            model: 'mistral',
            messages: [system, prompt],
            format: 'json'
        })

        const parsedRes = JSON.parse(output.message.content)
        console.log(parsedRes)
        return
    }
}