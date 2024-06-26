import { inject, injectable } from "inversify"
import { Data } from "../entities/data.entity"
import { TYPES } from "../infrastructure"
import { IDataRepository } from "../repositories/data.repository"
import { Ollama } from 'ollama'
import { Message } from "postcss"
import { MemoryLruService } from "./lru.service"

export interface Iollama {
    loadData(data: unknown): Promise<unknown>
    refetchHealthIndicatorFromFeedback(data: Data, indicator: number): Promise<unknown>
    refetchSatisfactionIndicatorFromFeedback(data: Data, indicator: number): Promise<unknown>
    fetchFeedbacks(): Promise<unknown>
    isQuestionAnswerCohesive(question: string, answer: string | null, theme: object): Promise<unknown>
    getThemeQuestion(question: string, theme: Array<string>): Promise<unknown>
    getThemeAnswer(answer: string, theme: Array<string>): Promise<unknown>
    fetchPatientPersona(messages: Message[]): Promise<unknown>
}

@injectable()
export class OllamaService implements Iollama {
    private lru: MemoryLruService<unknown>
    ollama: Ollama
    isLoaded = false
    
    constructor(
        @inject(TYPES.DataRepository) private dataRepository: IDataRepository
    ) {
        this.lru = new MemoryLruService<unknown>()
        this.ollama = new Ollama({ host: 'http://localhost:11434' })
        this.isLoaded = true
    }
    loadData(_: unknown): Promise<unknown> {
        throw new Error('Method not implemented.');
    }

    async refetchHealthIndicatorFromFeedback(data: Data, indicator: number): Promise<Data|null>
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
            content: 'Ce couple de question réponse a déà reçu un indicateur de santé. Le personnel de santé a éstimé que cet indicateur qui était de '+indicator+' était incorrect analyse à nouveau ce couple de question/réponse et redonne un indicateur de santé. Ne redonne pas le même indicateur.'
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

        console.log(parsedRes);

        if (typeof parsedRes.health_indicator !== "undefined" && typeof parsedRes.health_indicator === "number") {
            const updatedData = await this.dataRepository.updateDataNoteById(data, parsedRes.health_indicator);
            return updatedData
        }
        return null
    }

    async refetchSatisfactionIndicatorFromFeedback(data: Data, indicator: number): Promise<Data|null> 
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
            content: 'Ce couple de question réponse a déà reçu un indicateur de satisfaction. Le personnel de santé a éstimé que cet indicateur qui était de '+indicator+' était incorrect analyse à nouveau ce couple de question/réponse et redonne un indicateur de satisfaction. Ne redonne pas le même indicateur.'
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

        console.log(parsedRes)

        if (typeof parsedRes.satisfaction_indicator !== "undefined" && typeof parsedRes.satisfaction_indicator === "number") {
            const updatedData = await this.dataRepository.updateDataNoteById(data, parsedRes.satisfaction_indicator)
            return updatedData
        } else {
            return null
        }

    }

    async isQuestionAnswerCohesive(question: string, answer: string, theme: object): Promise<unknown> {
        if (!this.isLoaded) {
            throw new ErrorLoadingTooEarly()
        }
        const themesArray = []
        for (let i = 0; i < theme.length; i++) {
            themesArray.push(theme[i].name)
        }
        const system = {
            role: 'system',
            content: 'Tu es un expert de santé qui a plus de vingt ans d\'expérience et qui sait prendre en compte les retours de ses patients afin d\'en tirer des conclusions sur leur état de santé. Je vais te poser une question et une réponse donnée par un patient, et tu dois me dire si la réponse est cohérente avec la question et quelles sont liés à un des themes que je fourni, répond par oui si la réponse et la question possèdent le même theme (parmis les themes que je te fourni), sinon non. Réponds par "oui" ou "non" obligatoirement.Répond uniquement par OUI ou NON, pas de phrase, pas besoin de mexpliquer, je veux une réponse dans le format : { "cohesive": "oui" } ou { "cohesive": "non" }.'
        }
        const prompt = {
            role: 'user',
            content : 'Voici la question posée : "'+question+'", et voici la réponse donnée par le patient : "'+answer+'". Les themes sont : '+themesArray+'.'
        }
        const output = await this.ollama.chat({
            model: 'mistral',
            messages: [system, prompt],
            format: 'json'
        })
        return output
    }

    async getThemeQuestion(question: string, theme: object): Promise<unknown> {
        if (!this.isLoaded) {
            throw new ErrorLoadingTooEarly()
        }
        const themesArray = []
        for (let i = 0; i < theme.length; i++) {
            themesArray.push(theme[i].name)
        }
        const system = {
            role: 'system',
            content: 'Tu es un expert de santé qui a plus de vingt ans d\'expérience et qui sait prendre en compte les retours de ses patients afin d\'en tirer des conclusions sur leur état de santé. Je vais te poser une question et tu dois me dire à quel theme elle appartient parmis les thèmes suivants: '+themesArray+'. Réponds par le theme obligatoirement dans le format suivant { "theme": "<theme correspondant>" }.'
        }
        const prompt = {
            role: 'user',
            content : 'Voici la question posée : "'+question+'".'
        }
        const output = await this.ollama.chat({
            model: 'mistral',
            messages: [system, prompt],
            format: 'json'
        })
        return output
    }

    async getThemeAnswer(answer: string, theme: object): Promise<unknown> {
        if (!this.isLoaded) {
            throw new ErrorLoadingTooEarly()
        }
        const themesArray = []
        for (let i = 0; i < theme.length; i++) {
            themesArray.push(theme[i].name)
        }
        const system = {
            role: 'system',
            content: 'Tu es un expert de santé qui a plus de vingt ans d\'expérience et qui sait prendre en compte les retours de ses patients afin d\'en tirer des conclusions sur leur état de santé. Je vais te donner une réponse à une question et tu dois me dire à quel theme elle appartient parmis les thèmes suvant : '+ themesArray+ ', répond par le theme de la réponse obligatoirement dans ce format : { "theme": "<theme correspondant>" }.'
        }
        const prompt = {
            role: 'user',
            content : 'Voici la réponse donnée par le patient : "'+answer+'"'
        }
        const output = await this.ollama.chat({
            model: 'mistral',
            messages: [system, prompt],
            format: 'json'
        })
        return output
    }

    async doesTheAnswerIsUsable(answer: string): Promise<unknown> {
        if (!this.isLoaded) {
            throw new ErrorLoadingTooEarly()
        }
        const system = {
            role: 'system',
            content: 'Tu es un expert de santé qui a plus de vingt ans d\'expérience et qui sait prendre en compte les retours de ses patients afin d\'en tirer des conclusions sur leur état de santé. Je vais te poser une réponse et tu dois me dire si elle est compréhensible et ou utilisable pour obtenir le theme de cette réponse, cest à dire ou non, répond par "oui" si la réponse est utilisable, sinon "non, je veux une réponse dans le format : { "usable": "oui" } ou { "usable": "non" }.'
        }
        const prompt = {
            role: 'user',
            content : 'Voici la réponse donnée par le patient : "'+answer+'".'
        }
        const output = await this.ollama.chat({
            model: 'mistral',
            messages: [system, prompt],
            format: 'json'
        })
        return output
    }

  async fetchPatientPersona(messages: Message[]): Promise<unknown> {
    const key = JSON.stringify(messages)
    console.log("loading persona")

    const cache = this.lru.get(key)

    if (cache) {
        return cache
    }

    const system = {
        role: 'system',
        content: 'Tu es un expert de santé qui a plus de vingt ans d\'expérience et qui sait prendre en compte les retours de ses patients afin d\'en tirer des conclusions sur leur profil de patient. Tu as l\'habitude de communiquer avec tes patients via des messages et tu as donc pris l\'habitude de les comprendre via les discussions complètes et d\'en tirer une analyse complète du patient, sur le type de personne qu\'il est, sa tranche d\'âge, ses problèmes de santé, la gravité de son cas et pleins d\'autres élément dans le genre. Je vais te transmettre une discussion téléphonique complète entre un personnel de santé et un patient dans laquelle le professionnel de santé et le patient se parlent. Le format sera le suivant: <professionnel-sante: contenu de la question>, <patient: contenu de la réponse> - <patient: contenu de la question suivante>, <professionnel-sante: contenu de la réponse suivante>..... Donne moi d\'après la discussion une analyse complète du patient en suivant les critères que je t\'ai donné. Ta réponse aura le format suivant : {"description": string }.'
    }

    let promptContent = ""
    let dataIndex = 1
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].fromUser) {
        promptContent += `<patient: ${messages[i].content}>, `
      } else {
        promptContent += `<professionnel-sante: ${messages[i].content}> - `
        dataIndex++
      }
    }

    const prompt = {
        role: 'user',
        content : 'Voici la conversation téléphonique: '+promptContent
    }

    const output = await this.ollama.chat({
        model: 'mistral',
        messages: [system, prompt],
        format: 'json'
    })

    console.log('ANTOINE YY: ', output)

    this.lru.set(key, output)

    return output
  }
}
