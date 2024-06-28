import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Message } from "~/core.server/entities/message.entity";
import { Patient } from "~/core.server/entities/patient.entity";
import { TYPES } from "~/core.server/infrastructure";
import { container } from "~/core.server/inversify.config";
import { IPatientRepository } from "~/core.server/repositories/patient.repository";
import { IOffuscateService } from "~/core.server/services/offuscate.service";
import { IQueueService } from "~/core.server/services/queue.service";


export const action: ActionFunctionArgs = async ({ params }) => {
  const patientRepository = container.get<IPatientRepository>(TYPES.PatientRepository)
  const offuscateService = container.get<IOffuscateService>(TYPES.OffuscateService)

      const id = params['id']
      if (!id) {
        throw new Response(undefined, {
          status: 404
        })
      }
      const patient = await patientRepository.getById(parseInt(id));
      const themes = await offuscateService.getTheme(patient, ""); // Vous devrez ajuster cette partie pour passer le bon message ou gérer plusieurs messages.
  
      return json({ themes });

  
  };