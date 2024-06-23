import { TYPES } from './infrastructure'

import { Container } from 'inversify'
import { UserRepository } from './repositories/user.repository'
import { PrismaConnector } from './services/prisma.service'
import { Bcrypt } from './services/bcrypt.service'
import { Jwt } from './services/jwt.service'
import { Authentication } from './services/auth.service'

const container = new Container()
container.bind(TYPES.PrismaConnector).to(PrismaConnector).inSingletonScope()
container.bind(TYPES.UserRepository).to(UserRepository).inSingletonScope()
container.bind(TYPES.BcryptService).to(Bcrypt).inSingletonScope()
container.bind(TYPES.JwtService).to(Jwt).inSingletonScope()
container.bind(TYPES.AuthService).to(Authentication).inSingletonScope()

export { container }