import { LoaderFunctionArgs, defer, json, type MetaFunction } from "@remix-run/node";
import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import { TYPES } from "~/core.server/infrastructure";
import { container } from "~/core.server/inversify.config";
import { IPatientRepository } from "~/core.server/repositories/patient.repository";
import { ILruService } from "~/core.server/services/lru.service";
import { Iollama } from "~/core.server/services/ollama.service";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const id = params['id']
  const ollamaService = container.get<Iollama>(TYPES.OllamaService)

  if (!id) {
    throw new Response(undefined, {
      status: 404
    })
  }

  const patientRepository = container.get<IPatientRepository>(TYPES.PatientRepository)

  const patient = await patientRepository.getById(parseInt(id))

  const persona = new Promise<any>((resolve) => {

    ollamaService.fetchPatientPersona(patient.messages).then((iaContent) => {
      resolve(JSON.parse(iaContent.message.content).description)
    })
  })


  return defer({
    patientPersona: persona
  })
}

export const meta: MetaFunction = () => {
  return [
    { title: "Patients | Calmedica" },
  ];
};

export default function Index() {
  const { patientPersona } = useLoaderData<typeof loader>()

  return <div className="flex-1 p-12 flex items-stretch justify-stretch gap-12">
      <div className="flex-1 bg-[#f9faff] shadow-lg rounded-md p-8 flex flex-col gap-4">
        <h1 className="tracking-wider text-xl font-bold">Analyse du patient</h1>
        <Suspense fallback={<div>Loading...</div>}>
          <Await resolve={patientPersona}>
            {(resolvedValue) => <p className="tracking-widest text-gray-800">{resolvedValue}</p>}
          </Await>
        </Suspense>
      </div>
      <div className="flex-1 bg-[#f9faff] shadow-lg rounded-md p-8 flex items-center justify-center">
        <img src="/surgery.webp" alt="" />
      </div>
    </div>
}


export function ErrorBoundary() {
  return <div className="w-full h-full flex flex-col gap-4 items-center justify-center">
  <h1 className="text-4xl font-bold">The patient has not been found</h1>
  <span className="text-xl">Select a patient on the left panel</span>
  
</div>
}
