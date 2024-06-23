import { inject, injectable } from 'inversify';
import { TYPES } from '../infrastructure';
import { IPrismaConnector } from '../services/prisma.service';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';
import { User } from '../entities/user.entity';

export interface IUserRepository {
    getUserByEmail(email: string): Promise<User>
    create(user: Omit<User, 'id'>): Promise<User>
}

@injectable()
export class UserRepository implements IUserRepository {
    private user: Prisma.UserDelegate<DefaultArgs>
    
    constructor(@inject(TYPES.PrismaConnector) prisma: IPrismaConnector) {
        this.user = prisma.getPrisma().user
    }
    
    
    async create(data: Omit<User, 'id'>): Promise<User> {
        const user = await this.user.create({
            data
        })

        return User.ToUser(user)
    }

    async getUserByEmail(email: string): Promise<User> {
        const user = await this.user.findFirst({
            where: {
                email
            }
        })

        if (!user) {
            throw new Error('No user found')
        }

        return User.ToUser(user)
    }
}