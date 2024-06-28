import { type MetaFunction } from "@remix-run/node";
import { NavLink } from '@remix-run/react';

export const meta: MetaFunction = () => {
  return [
    { title: "Feedbacks | Calmedica" },
  ]
}

export default function Index() {
  return <div className="w-full h-screen overflow-scroll p-16">
    <div className='flex flex-col gap-8'>

    <h1 className="font-bold text-4xl">Feedbacks</h1>
    <div className="flex items-center gap-4">
      <NavLink to={'/feedbacks/sante'} className="rounded-lg shadow-xl bg-white p-4">
        Sante
      </NavLink>
      <NavLink to={'/feedbacks/satisfaction'} className="rounded-lg shadow-xl bg-white p-4">
        Satisfaction
      </NavLink>
      <NavLink to={'/feedbacks/information'} className="rounded-lg shadow-xl bg-white p-4">
        Information
      </NavLink>
      <NavLink to={'/feedbacks/simulations'} className="rounded-lg shadow-xl bg-white p-4">
        Simulations
      </NavLink>
    </div>
    </div>
  </div>
}

