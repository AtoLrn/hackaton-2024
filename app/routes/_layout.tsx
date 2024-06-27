import { Link, NavLink, Outlet } from "@remix-run/react"
import { createContext, useCallback, useState } from "react";
import { BsGraphUp } from "react-icons/bs"
import { TbNotes } from "react-icons/tb"
import { Patient } from "~/core.server/entities/patient.entity";

export type Subscriptions = string[]

export const SubscritionContext = createContext<{
  addSubscription: (id: string, cb: () => void) =>void
} | null>(null);


export default function Layout ()  {
  const [ patients, setPatiens ] = useState<Patient[]>([])

  const subscribe = useCallback((s: string) => {
    return new Promise<Patient>((resolve) => {
      const sse = new EventSource(`/patients/${s}/anonymize`)
  
      sse.onerror = () => {
        sse.close()
      }
  
      sse.onmessage = (event) => {
        const patient = JSON.parse(event.data) as Patient
        resolve(patient)
      }
    })
   
  }, [])


  const addSubscription = useCallback((id: string, cb: () => void) => {
    subscribe(id).then((patient) => {
      setPatiens((p) => [
        ...p,
        patient
      ])
      cb()
    })
  }, [])


    return <main className="w-full h-screen flex bg-[#f9faff]">
    <nav className="h-screen w-80 flex flex-col justify-between items-stretch gap-12 bg-white">
      <h1 className="w-full h-32 flex items-center px-8">
        <img src="/logo.png" className="w-full" alt="" />
      </h1>
      <ul className="flex-1 flex flex-col p-4 gap-2">
        <li>
          <NavLink to={'/patients'} className="flex duration-200 items-center gap-2 px-4 py-3 rounded-xl aria-[current]:bg-[#fb4f14] bg-slate-200 text-black aria-[current]:text-white font-bold">
          <TbNotes />
          <span className="tracking-wider">
              Patients
            </span>
          </NavLink>
          
        </li>
        <li>
          <NavLink to={'/feedbacks'} className="flex duration-200 items-center gap-2 px-4 py-3 rounded-xl aria-[current]:bg-[#fb4f14] bg-slate-200 text-black aria-[current]:text-white font-bold">
          <BsGraphUp />
            <span className="tracking-wider">
              Feedbacks
            </span>
          </NavLink>
          
        </li>
      </ul>
      <section className="bg-[#eaecfb] rounded-xl m-4  flex gap-4 p-2 items-center cursor-pointer">
          <div className="aspect-square h-12 bg-purple-600 rounded-full overflow-hidden">
            <img src="/profile.jpg"  alt="" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold">Infirmiere</span>
            <span>Infirmiere</span>
          </div>
      </section>
    </nav>
    <SubscritionContext.Provider value={{ addSubscription }}>
      <Outlet context={{ addSubscription }} />
    </SubscritionContext.Provider>
    <div className="absolute bottom-4 right-4 max-w-96">
      <ul className="flex flex-col-reverse gap-4">
      { patients.map((p) => {
          return <li className="bg-[#fb4f14] text-white text-lg tracking-wider shadow-lg px-8 py-4 rounded-lg" key={p.id}>
            Click <a className="text-blue-600 underline" download={`anonymized-discussion-${p.id}.txt`} href={`data:text/plain;charset=utf-8,${encodeURIComponent(p.messages.reduce((acc, val) => {
              return `${acc}${val.fromUser ? 'Patient' : 'Infirmier' }: ${val.content}\n`
            }, ''))}`}>Here</a> to export the patient <b>#{p.id}</b> ({p.name} {p.lastname}) anonymized messages
          </li>
      } )}

      </ul>
    </div>
  </main> 
}
