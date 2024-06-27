import levenshtein from 'fast-levenshtein'
import { inject, injectable } from "inversify"
import { TYPES } from '../infrastructure'
import { OllamaService } from './ollama.service'
import { Ollama } from 'ollama'
import Zod from 'zod'

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
    static model = Zod.object({
        results: Zod.array(Zod.object({
            matched: Zod.string(),
            rate: Zod.number(),
        }))
    })
    private ollama: Ollama
    public constructor(@inject(TYPES.OllamaService) ollama: OllamaService) {
        this.ollama = ollama.ollama
    }

    public compare = async (message: string): Promise<ICompareServiceResults[] | undefined> => {        
        const system = {
                role: 'system',
                content: `Extract the personals informations in the provided texts with the following rules:
- Match only informations that correspond to PII (Personally identifiable information) such as name
- Match the city name
- Match the doctor's name
- Match the phone number
- Ignore the medicals informations
- Ignore the pronouns
- Do not match the words that follow this pattern [UPPERCASE]
- Answer in this pattern where matched is the string to replace and rate the trust rate: {"results": [{"matched": "string", "rate": float}]`
        }
        
        const prompt = {
            role: 'user',
            content : `${message}`
        }

        try {
            const output = await this.ollama.chat({
                model: 'llama3',
                messages: [
                    system, 
                    // assistant, 
                    prompt
                ],
                format: 'json'
            })

            const results = JSON.parse(output.message.content) as unknown
            
            const parsed = OllamaCompare.model.parse(results)

            return parsed.results
        } catch {
            return []
        }
        
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