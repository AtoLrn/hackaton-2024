import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import csvParser from 'csv-parser'

const prisma = new PrismaClient();

async function main() {
  const themes = ['HEALTH', 'INFORMATION', 'SATISFACTION', 'OTHER'];

  for (const themeName of themes) {
    await prisma.theme.upsert({
      where: { name: themeName },
      update: {},
      create: {
        name: themeName,
      },
    });
  }

  const csvFilePath = './data.csv';
  const dataEntries = [];

  console.log("Processing CSV data...")
  fs.createReadStream(csvFilePath)
    .pipe(csvParser())
    .on('data', (row) => {
      dataEntries.push({
        question: row.question,
        reponse: row[' reponse'],
        exploitable: false,
        note: 0,
        isReponseConsistent: false
      });
    })
    .on('end', async () => {
      for (const entry of dataEntries) {
        await prisma.data.create({
          data: entry
        });
      }
      console.log('CSV file successfully processed and data inserted.');
      await prisma.$disconnect();
    });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
