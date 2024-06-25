import { NavLink, Outlet } from "@remix-run/react"
import { BsGraphUp } from "react-icons/bs"
import { TbNotes } from "react-icons/tb"

export default function Layout ()  {
    return <main className="w-full h-screen flex bg-[#f9faff]">
    <nav className="h-screen w-80 flex flex-col justify-between items-stretch gap-12 bg-white">
      <h1 className="w-full h-32 flex items-center px-8">
        <img src="/logo.png" className="w-full" alt="" />
      </h1>
      <ul className="flex-1 flex flex-col p-4 gap-2">
        <li>
          <NavLink to={'/patients'} className="flex duration-200 items-center gap-2 px-4 py-3 rounded-xl aria-[current]:bg-[#fb4f14] bg-slate-200 text-black aria-[current]:text-white font-bold">
          <TbNotes />
            <span>
              Patients
            </span>
          </NavLink>
          
        </li>
        <li>
          <NavLink to={'/feedbacks'} className="flex duration-200 items-center gap-2 px-4 py-3 rounded-xl aria-[current]:bg-[#fb4f14] bg-slate-200 text-black aria-[current]:text-white font-bold">
          <BsGraphUp />
            <span>
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
    <Outlet />

  </main> 
}
