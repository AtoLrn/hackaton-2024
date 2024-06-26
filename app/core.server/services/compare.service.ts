import levenshtein from 'fast-levenshtein'
import { inject, injectable } from "inversify"
import { TYPES } from '../infrastructure'
import { OllamaService } from './ollama.service'
import { Ollama } from 'ollama'

export interface ICompareService {
    compare(stringA: string, stringB: string): ICompareServiceResults[] | undefined  
}

export interface ICompareSingleService {
    compare(string: string): Promise<ICompareServiceResults[] | undefined>  
}

export interface ICompareServiceResults {
    rate: number,
    matched: string
}

@injectable()
export class IncludeCompare implements ICompareService {
    compare(stringA: string, stringB: string): ICompareServiceResults[] | undefined {        
        if (stringB.includes(stringA)) {
            return [{
                rate: 1,
                matched: stringA
            }]
        }

        return undefined
    }
}

@injectable()
export class OllamaCompare implements ICompareSingleService {
    private ollama: Ollama
    public constructor(@inject(TYPES.OllamaService) ollama: OllamaService) {
        this.ollama = ollama.ollama
    }

    public compare = async (message: string): Promise<ICompareServiceResults[] | undefined> => {        
        const systems = [
            {
                role: 'system',
                content: "Tu dois supprimer toutes les informations personnelles mais absolument conserver les informations médicales dans le message. Tu dois ignorer les mots qui suivent ce modèle \\[[A-Z]+\\] car ils représentent des données déjà anonymisées. Vous devez retourner la chaîne qui correspond à une information personnelle sous le format suivant: {\"results\": [{\"matched\": \"string\", \"rate\": float}]"
            },   
        ]

        const prompt = {
            role: 'user',
            content : `${message}`
        }

        const output = await this.ollama.chat({
            model: 'llama3',
            messages: [...systems, prompt],
            format: 'json'
        })

        const results = JSON.parse(output.message.content) as { results: ICompareServiceResults[] }

        return results.results
    }
}

@injectable()
export class LevenshteinCompare implements ICompareService {
    compare(stringA: string, stringB: string): ICompareServiceResults[] | undefined {
        const wordCount = stringA.split(' ').length
        const words = stringB.split(' ')

        const matches: ICompareServiceResults[] = []

        for (let i = 0; i <= words.length - wordCount; i++) {
            let biggestMatch: ICompareServiceResults | undefined = undefined
            for (let y = 1; y <= wordCount; y++) {
                const phrase = words.slice(i, y + i).join(' ')
                
                const results = levenshtein.get(stringA, phrase)
    
                const match = {
                    rate: (stringA.length - results) / stringA.length,
                    matched: phrase
                }

                if (!biggestMatch) {
                    biggestMatch = match
                } else if (biggestMatch && match.rate > biggestMatch.rate) {
                    biggestMatch = match
                }    
            }

            if (biggestMatch) {
                matches.push(biggestMatch)
            }
        }
        
        return matches
    }
}