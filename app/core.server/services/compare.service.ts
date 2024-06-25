import levenshtein from 'fast-levenshtein'
import { injectable } from "inversify"

export interface ICompareService {
    compare(stringA: string, stringB: string): ICompareServiceResults[] | undefined  
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