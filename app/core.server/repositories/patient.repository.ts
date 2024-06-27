import { injectable } from 'inversify';


import { Patient } from '../entities/patient.entity';
import { Message } from '../entities/message.entity';

export interface IPatientRepository {
    getAll(): Promise<Patient[]>
    getById(id: Patient['id']): Promise<Patient>
}

@injectable()
export class PatientRepository implements IPatientRepository {
    
    private patients: Patient[] = [
        new Patient(
          1234122,
          "Antoine",
          "Lorin",
          "antoine.lorin2@gmail.com",
          "99 Rue de conflans Herblay",
          "+33621395898",
          [
            new Message(
              "Bonjour docteur, j'ai de la fièvre et des maux de tête depuis deux jours.",
              true
            ),
            new Message(
              "Bonjour XXXXXAntoineXXXXX, avez-vous d'autres antoine.lorin2@gmail.com symptômes tels que des courbatures, de la fatigue ou des frissons ? Avez-vous pris votre température ? Et pourriez-vous me confirmer votre adresse ?",
              false
            ),
            new Message(
              "Oui, Ma fille s'appelle Jeanne j'ai aussi des courbatures et je me sens très fatigué. Ma température est de 38,5°C. Mon adresse est 99 Rue de conflans",
              true
            ),
            new Message(
              "D'accord, il semble que vous ayez une infection virale. Je vous recommande de vous reposer, de bien vous hydrater, et de prendre du paracétamol pour la fièvre et les douleurs. Si les symptômes persistent ou s'aggravent, prenez rendez-vous pour une consultation.",
              false
            ),
            new Message(
              "Merci docteur, je vais suivre vos conseils. Je vous contacterai si nécessaire.",
              true
            ),
            new Message(
              "De rien Antioine, prenez soin de vous et n'hésitez pas à me recontacter si besoin. Bonne journée.",
              false
            )
          ]
        ),
        new Patient(
          1212334122,
          "Sophie-Marie",
          "Hoehle",
          "sophie.marie.hoehle@gmail.com",
          "102 Rue de conflans Herblay",
          "+33622395898",
          [
            new Message(
              "Bonjour docteur, j'ai des douleurs persistantes au niveau du bas du dos depuis quelques semaines.",
              true
            ),
            new Message(
              "Bonjour Sophie-Mari, pourriez-vous me décrire l'intensité et la localisation précise de la douleur ? Est-ce que quelque chose aggrave ou soulage cette douleur ?",
              false
            ),
            new Message(
              "La douleur est surtout localisée sur le côté gauche, elle est assez intense, environ 7 sur 10. Elle empire quand je reste assise longtemps, mais s'améliore un peu avec des étirements.",
              true
            ),
            new Message(
              "Merci pour ces précisions. Avez-vous récemment subi un traumatisme ou fait un mouvement brusque ? Je vous recommande de prendre rendez-vous pour un examen clinique approfondi.",
              false
            ),
            new Message(
              "Non, je n'ai pas eu de traumatisme récent. Je vais prendre rendez-vous. Merci docteur.",
              true
            ),
            new Message(
              "Très bien, à bientôt Sophie-Marie. Prenez soin de vous en attendant. Hoohle",
              false
            )
          ]
        ),
      ] 
    
    async getAll(): Promise<Patient[]> {
        return this.patients
    }

    async getById(id: Patient['id']): Promise<Patient> {
        const patient = this.patients.find((p) => p.id === id)
        
        if (!patient) {
            throw new Response(undefined, {
            status: 404
            })
        }

        return patient
    }
}