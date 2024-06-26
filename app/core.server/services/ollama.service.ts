import { inject, injectable } from "inversify"
import { Data } from "../entities/data.entity"
import { TYPES } from "../infrastructure"
import { IDataRepository } from "../repositories/data.repository"
import { Ollama } from 'ollama'

export interface Iollama {
    loadData(data: unknown): Promise<unknown>
    refetchHealthIndicatorFromFeedback(data: Data, indicator: number): Promise<unknown>
    refetchSatisfactionIndicatorFromFeedback(data: Data, indicator: number): Promise<unknown>
}

@injectable()
export class OllamaService implements Iollama {
    ollama: Ollama
    isLoaded = false
    
    constructor(
        @inject(TYPES.DataRepository) private dataRepository: IDataRepository
    ) {
        this.ollama = new Ollama({ host: 'http://localhost:11434' })
        this.isLoaded = true
    }
    loadData(_: unknown): Promise<unknown> {
        throw new Error('Method not implemented.');
    }

    async refetchHealthIndicatorFromFeedback(data: Data, indicator: number): Promise<unknown>
    {
        const system = {
            role: 'system',
            content: 'Tu es un expert de santé qui a plus de vingt ans d\'expérience et qui sait prendre en compte les retours de ses patients afin d\'en tirer des conclusions sur leur état de santé. Je vais te soumettre une question posé par un service automatique ou par un personnel de santé, et une réponse donné par un patient pouvant ne pas être à l\'aise avec la technologie. Si la question est à propos de la douleur, prends le en compte, si le patient n\'a pas ou peu de douleurs, c\'est que le health_indicator doit être très élevé. Donne moi un indicateur de 1 à 10 sur l\'état de santé du patient (1 : état de santé critique, 10: état de santé parfait),  ainsi qu\'une note de 1 à 10 qui note la compatibilité de la réponse (1: la réponse ne correspond pas du tout à la question, 10: la réponse correspond parfaitement à la question).'
        }
        const systemAbreviations = {
            role: 'system',
            content: 'Voici une lise des abréviations utilisées, prends les en compte dans ta notation : "TVB" pour "TOUT VA BIEN", "AID" pour "AIDE"'
        }
        const systemFormat = {
            role: 'system',
            content: 'Ton format de retour est : {"health_indicator": int, "compatibility": int}'
        }
        const systemAdditionalInfo = {
            role: 'system',
            content: 'Ce couple de question réponse a déà reçu un indicateur de santé. Le personnel de santé a éstimé que cet indicateur qui était de '+indicator+' était incorrect.'
        }
        const prompt = {
            role: 'user',
            content : 'Voici la question posée : "'+data.question+'"(si la question contient une échelle différente, ignore l\'échelle donnée dans la question ne renvoie qu\'une note de 1 à 10), et voici la réponse donnée par le patient : "'+data.reponse+'".'
        }
        const output = await this.ollama.chat({
            model: 'mistral',
            messages: [system, systemAbreviations, systemFormat, systemAdditionalInfo, prompt],
            format: 'json'
        })

        const parsedRes = JSON.parse(output.message.content)

        if (typeof parsedRes.health_indicator !== "undefined" && typeof parsedRes.health_indicator !== "number") {
            const updatedData = await this.dataRepository.updateDataNoteById(data, parsedRes.health_indicator);
        }

        return parsedRes
    }

    async refetchSatisfactionIndicatorFromFeedback(data: Data, indicator: number): Promise<unknown> 
    {
        const system = {
            role: 'system',
            content: 'Tu es un personnel d\'hôpital qui s\'occupe des patients. Tu sais prendre en compte les avis des patients sur leur séjour à l\'hôpital, la pénibilité et la facilité des différentes tâches et en tirer un indicateur de satisfaction. Je vais te poser des questions et en fonction de la réponse, donne-moi un indicateur de 1 à 10 sur l\'état de satisfaction du patient ainsi qu\'une note de 1 à 10 qui note la compatibilité de la réponse à la question.'
        }
        const systemAbreviations = {
            role: 'system',
            content: 'Voici une lise des abréviations utilisées : "TVB" pour "TOUT VA BIEN", "AID" pour "AIDE"'
        }
        const systemFormat = {
            role: 'system',
            content: 'Ton format de retour est : {"satisfaction_indicator": int, "compatibility": int}'
        }
        const systemAdditionalInfo = {
            role: 'system',
            content: 'Ce couple de question réponse a déà reçu un indicateur de satisfaction. Le personnel de santé a éstimé que cet indicateur qui était de '+indicator+' était incorrect.'
        }
        const prompt = {
            role: 'user',
            content : 'Voici la question posée :  "'+data.question+'" (si la question contient une échelle différente, ignore l\'échelle donnée dans la question ne renvoie qu\'une note de 1 à 10), et voici la réponse donnée par le patient : "'+data.reponse+'".'
        }
        const output = await this.ollama.chat({
            model: 'mistral',
            messages: [system, systemAbreviations, systemFormat, systemAdditionalInfo, prompt],
            format: 'json'
        })

        const parsedRes = JSON.parse(output.message.content)

        if (typeof parsedRes.satisfaction_indicator !== "undefined" && typeof parsedRes.satisfaction_indicator !== "number") {
            const updatedData = await this.dataRepository.updateDataNoteById(data, parsedRes.satisfaction_indicator);
        }

        return parsedRes
    }
}