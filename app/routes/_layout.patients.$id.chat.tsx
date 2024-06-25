import { LoaderFunctionArgs, json, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Message } from "~/core.server/entities/message.entity";
import { TYPES } from "~/core.server/infrastructure";
import { container } from "~/core.server/inversify.config";
import { IPatientRepository } from "~/core.server/repositories/patient.repository";
import { IOffuscateService } from "~/core.server/services/offuscate.service";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const id = params['id']

  if (!id) {
    throw new Response(undefined, {
      status: 404
    })
  }

  const patientRepository = container.get<IPatientRepository>(TYPES.PatientRepository)
  const offuscateService = container.get<IOffuscateService>(TYPES.OffuscateService)

  const patient = await patientRepository.getById(parseInt(id))

  const messages = await Promise.all(patient.messages.map(async ({ content, fromUser }) => {
    return new Message(
      await offuscateService.offuscate(patient, content),
      fromUser
    )
  }))

  patient.messages = messages

  return json({
    patient
  })
}

export const meta: MetaFunction = () => {
  return [
    { title: "Patients | Calmedica" },
  ];
};

export default function Index() {
  const { patient } = useLoaderData<typeof loader>()

  return <div className="flex-1 p-12 flex items-stretch justify-stretch gap-12">
      <div className="flex-1 bg-[#f9faff] shadow-lg rounded-md p-8 flex flex-col gap-4">
        <h1 className="tracking-wider text-xl font-bold">Chat</h1>
        <ul className="flex flex-col gap-2">
          { patient.messages.map(({ content, fromUser }) => {
            return <li className={"p-2  rounded-lg shadow-xl max-w-[80%] " + (fromUser ? "self-end" : "text-black bg-[#ff8b64]")}  key={content}>
              <p>{ content }</p>
            </li>
            })
          }
        </ul>
        
      </div>
    </div>
}


export function ErrorBoundary() {
  return <div className="w-full h-full flex flex-col gap-4 items-center justify-center">
  <h1 className="text-4xl font-bold">The patient has not been found</h1>
  <span className="text-xl">Select a patient on the left panel</span>
  
</div>
}