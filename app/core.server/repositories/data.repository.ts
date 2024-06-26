import { inject, injectable } from 'inversify';
import { TYPES } from '../infrastructure';
import { IPrismaConnector } from '../services/prisma.service';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';
import { Data } from '../entities/data.entity';

export interface IDataRepository {
    getDataById(id: number): Promise<Data>
    getDataByTheme(theme: string): Promise<Data[]>
    getThemeByDataId(id: number): Promise<string>
    updateDataNoteById(data: Data, note: number): Promise<Data>
    getDataByThemeByNote(theme: string, note: number): Promise<Data[]>
}

@injectable()
export class DataRepository implements IDataRepository {
    private data: Prisma.dataDelegate<DefaultArgs>
    private theme: Prisma.ThemeDelegate<DefaultArgs>
    
    constructor(@inject(TYPES.PrismaConnector) prisma: IPrismaConnector) {
        this.data = prisma.getPrisma().data
        this.theme = prisma.getPrisma().theme
    }

    async getDataById(id: number): Promise<Data> {
        const data = await this.data.findUnique({
            where: {
                id
            }
        });

        return Data.ToData(data)
    }

    async getThemeByDataId(id: number): Promise<string> {
      const theme = await this.theme.findUnique({
        where: {
          id
        }
      });
      return theme.name
    }
    
    async getDataByTheme(theme: string): Promise<Data[]> {
      const themeDb = await this.theme.findUnique({ 
        where: {
          name: theme
        }
      });

      if (!themeDb) {
        return []
      }
      const dataList = await this.data.findMany({ 
        where: {
          themeReponseId: themeDb.id
        } 
      });

      return dataList.map(data => Data.ToData(data))
    }

    async getDataByThemeByNote(theme: string, note: number): Promise<Data[]> {
      const dataList = await this.data.findMany({
        where: {
          note
        }
      });

      return dataList.map(data => Data.ToData(data))
    }

    async updateDataNoteById(data: Data, note: number): Promise<Data> {
      const updatedData = await this.data.update({
        where: {
          id: data.id
        },
        data: {
          note
        }
      });

      return Data.ToData(updatedData)
    }
}
