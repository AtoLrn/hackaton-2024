import { injectable } from "inversify"

export interface ICompareService {
    compare(stringA: string, stringB: string): ICompareServiceResults | undefined  
}

export interface ICompareServiceResults {
    rate: number,
    matched: string
}

@injectable()
export class IncludeCompare implements ICompareService {
    compare(stringA: string, stringB: string): ICompareServiceResults | undefined {
        if (stringB.includes(stringA)) {
            return {
                rate: 1,
                matched: stringA
            }
        }
        
        return undefined
    }
}

@injectable()
export class LevenshteinCompare implements ICompareService {
    compare(stringA: string, stringB: string): ICompareServiceResults | undefined {
        if (stringB.includes(stringA)) {
            return {
                rate: 1,
                matched: stringA
            }
        }
        return undefined
    }
}