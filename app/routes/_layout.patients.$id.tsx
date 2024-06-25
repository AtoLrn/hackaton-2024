import { LoaderFunctionArgs, json, type MetaFunction } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
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

  return <div className="w-full h-full flex flex-col">
    <div className="flex items-stretch justify-between bg-[#eaecfb]">
      <div className="flex flex-col w-full p-12 gap-3 flex-1">
        <div className="flex items-center justify-between">
          <h1 className="font-bold uppercase text-3xl">{patient.name} {patient.lastname}</h1>
          <section className="flex items-center gap-4 opacity-50">
            <Link to={`/patients/${patient.id}/chat`}>
              <IoIosSend size={24} />
            </Link>
            <IoIosCall size={24} />
          </section>
        </div>
        <span className="tracking-widest">30 year old - 17 April 2024</span>
        <span className="tracking-widest">30 year old - 17 April 2024</span>
      </div>
      <div className="aspect-square bg-[#f9faff] gap-4 flex items-center flex-col justify-center">
        <span className="text-2xl font-bold tracking-widest">12/04</span>
        <span className="tracking-widest">Next visit</span>
      </div>
    </div>
    <Outlet />
  </div>
}


export function ErrorBoundary() {
  return <div className="w-full h-full flex flex-col gap-4 items-center justify-center">
  <h1 className="text-4xl font-bold">The patient has not been found</h1>
  <span className="text-xl">Select a patient on the left panel</span>
  
</div>
}