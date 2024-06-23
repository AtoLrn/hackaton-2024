import { type MetaFunction } from "@remix-run/node";


export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard | Patients" },
  ];
};

export default function Index() {
  return <div className="w-full min-h-screen h-10 p-16 flex flex-col gap-4">
    <h1 className="font-bold text-4xl">Patients</h1>
    <div className="flex items-center">
      <span className="p-12 pb-8 shadow-xl rounded-xl text-white font-bold text-xl triangle bg-[#fb4f14] flex flex-col items-center justify-end  gap-2">
        <span>
          12
        </span>
        <span>
          Urgences
        </span>
      </span>
    </div>
  </div>
}

