import { type MetaFunction } from "@remix-run/node";


export const meta: MetaFunction = () => {
  return [
    { title: "Patients | Calmedica" },
  ];
};

export default function Index() {
  return <div className="w-full h-full flex flex-col gap-4 items-center justify-center">
    <h1 className="text-4xl font-bold">No Patient Selected</h1>
    <span className="text-xl">Select a patient on the left panel</span>
    
  </div>
}
