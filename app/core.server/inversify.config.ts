import { TYPES } from './infrastructure'

import { Container } from 'inversify'
import { UserRepository } from './repositories/user.repository'
import { PrismaConnector } from './services/prisma.service'
import { Bcrypt } from './services/bcrypt.service'
import { Jwt } from './services/jwt.service'
import { Authentication } from './services/auth.service'
import { OllamaService } from './services/ollama.service'
import { PatientRepository } from './repositories/patient.repository'
import { OffuscateService } from './services/offuscate.service'
import { DataRepository } from './repositories/data.repository'
import { IncludeCompare, LevenshteinCompare, OllamaCompare } from './services/compare.service'
import { MemoryQueueService } from './services/queue.service'
import { EventRepository } from './repositories/event.repository'

const container = new Container()
container.bind(TYPES.PrismaConnector).to(PrismaConnector).inSingletonScope()
container.bind(TYPES.UserRepository).to(UserRepository).inSingletonScope()
container.bind(TYPES.DataRepository).to(DataRepository).inSingletonScope()
container.bind(TYPES.BcryptService).to(Bcrypt).inSingletonScope()
container.bind(TYPES.JwtService).to(Jwt).inSingletonScope()
container.bind(TYPES.AuthService).to(Authentication).inSingletonScope()
container.bind(TYPES.OllamaService).to(OllamaService).inSingletonScope()
container.bind(TYPES.PatientRepository).to(PatientRepository).inSingletonScope()
container.bind(TYPES.CompareService).to(LevenshteinCompare).inSingletonScope()
container.bind(TYPES.CompareService).to(IncludeCompare).inSingletonScope()
container.bind(TYPES.CompareSingleService).to(OllamaCompare).inSingletonScope()
container.bind(TYPES.OffuscateService).to(OffuscateService).inSingletonScope()
container.bind(TYPES.QueueService).to(MemoryQueueService).inSingletonScope()
container.bind(TYPES.EventRepository).to(EventRepository).inSingletonScope()

export { container }
