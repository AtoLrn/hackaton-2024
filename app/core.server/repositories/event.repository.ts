import { injectable } from 'inversify';

import { Event, EventType } from '../entities/event.entity';

export interface IEventRepository {
    getAll(): Promise<Event[]>
}

@injectable()
export class EventRepository implements IEventRepository {
  private events: Event[] = []

  constructor() {
    this.events = this.generateEvents(200)
  }

  getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getRandomDate(): Date {
    let month: number;
    const random = Math.random();
    
    if (random < 0.4) {
        // 40% chance of getting a date in December
        month = 11;
    } else if (random < 0.65) {
        // 30% chance of getting a date in June
        month = 5;
    } else if (random < 0.70) {
        // 30% chance of getting a date in June
        month = 6;
    } else if (random < 0.75) {
        // 30% chance of getting a date in June
        month = 4;
    } else {
        // 30% chance of getting a date in any other month
        month = this.getRandomInt(0, 11);
    }

    const day = this.getRandomInt(1, 28); // To avoid complications with different month lengths
    const year = new Date().getFullYear();
    return new Date(year, month, day);
}

generateEvents(numberOfEvents: number): Event[] {
  const diseases = ["Covid-19", "Grippe", "Grippe"]
  const events: Event[] = [];
  let operationCount = 0;
  
  for (let i = 0; i < numberOfEvents; i++) {
      const randomType = Math.random();
      let event: Event;
      
      if (randomType < 0.3 && operationCount > 0) {
            const randomTypeInterval = Math.random();

          // 30% chance of CANCEL event if there is at least one operation
          const operationEvent = events[this.getRandomInt(0, operationCount - 1)];
          const cancelDate = new Date(operationEvent.date);
          cancelDate.setDate(cancelDate.getDate() - this.getRandomInt(1, randomTypeInterval > 0.5 ? 7 : 31)); // Set cancel date within the week before the operation

          event = new Event(
              i + 1, // id
              cancelDate, // date
              EventType.CANCEL, // type
              operationEvent.id // operationId
          );
      } else if (randomType < 0.6) {
          // 30% chance of OPERATION event
          const operationDate = this.getRandomDate();
          operationCount++;

          event = new Event(
              i + 1, // id
              operationDate, // date
              EventType.OPERATION // type
          );
      } else {
          // 40% chance of DISEASE event
          const diseaseDate = this.getRandomDate();
          const disease = diseases[this.getRandomInt(0, diseases.length - 1)];
          
          event = new Event(
              i + 1, // id
              diseaseDate, // date
              EventType.DISEASE, // type
              undefined, // operationId
              disease // disease
          );
      }

      events.push(event);
  }

  return events;
}
    
  async getAll(): Promise<Event[]> {
      return this.events
  }
}