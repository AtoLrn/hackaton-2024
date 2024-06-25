import { LoaderFunctionArgs, json, type MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { IoIosCall, IoIosSend } from "react-icons/io";
import { TYPES } from "~/core.server/infrastructure";
import { container } from "~/core.server/inversify.config";
import { IPatientRepository } from "~/core.server/repositories/patient.repository";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const id = params['id']

  if (!id) {
    throw new Response(undefined, {
      status: 404
    })
  }

  const patientRepository = container.get<IPatientRepository>(TYPES.PatientRepository)

  const patient = await patientRepository.getById(parseInt(id))

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
        <h1 className="tracking-wider text-xl font-bold">Analyse du patient</h1>
        <p className="tracking-widest text-gray-800">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tempora maxime amet eius nostrum aliquid</p>
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