import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { injectable, preDestroy } from "inversify";

export interface IPrismaConnector {
    getPrisma(): PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
}

@injectable()
export class PrismaConnector implements IPrismaConnector {
    public prisma: PrismaClient
    
    constructor() {
        this.prisma = new PrismaClient()
    }
    getPrisma() {
        return this.prisma
    }

    @preDestroy()
    cleanup() {
        this.prisma.$disconnect()
    }
}