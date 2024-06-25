import { json, type MetaFunction } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { TYPES } from "~/core.server/infrastructure";
import { container } from "~/core.server/inversify.config";
import { IPatientRepository } from "~/core.server/repositories/patient.repository";

export const loader = async () => {

  const patientRepository = container.get<IPatientRepository>(TYPES.PatientRepository)

  const patients = await patientRepository.getAll()

  return json({
    patients
  })
}

export const meta: MetaFunction = () => {
  return [
    { title: "Patients | Calmedica" },
  ];
};

export default function Index() {
  const { patients } = useLoaderData<typeof loader>()
  return <div className="w-full min-h-screen h-10  flex gap-4">
    <div className="w-5/12 flex flex-col gap-8 p-16">
      <div className="flex flex-col gap-4">
        <h1 className="font-bold text-4xl">Patients</h1>
        <input type="text" placeholder="Search" className="text-lg bg-transparent" />
      </div>
      <ul className="flex flex-col gap-4">
        { patients.map((patient) => {
          return <li key={patient.id}>
          <NavLink to={`/patients/${patient.id}`} className="group duration-300 w-full h-16 p-4 bg-white shadow-lg rounded-md flex items-center justify-between aria-[current]:bg-[#fb4f14] aria-[current]:text-white">
            <div className="flex flex-col">
              <span className="font-bold">{patient.id}</span>
              <span className="text-sm text-gray-600 group-aria-[current]:text-gray-200 duration-300">Operation du genou</span>
            </div>
            <div className="flex flex-col items-end">
                <span>12-04-2024</span>
                <span className="text-sm text-green-600 group-aria-[current]:text-gray-200 duration-300">Message</span>
            </div>
          </NavLink>
        </li>
        }) }
      
      </ul>
    <div className="flex items-center">

    </div>
    </div>
    <div className="w-7/12 bg-white h-full">
      <Outlet />
    </div>
  </div>
}
