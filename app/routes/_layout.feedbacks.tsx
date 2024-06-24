import { type MetaFunction } from "@remix-run/node";


export const meta: MetaFunction = () => {
  return [
    { title: "Feedbacks | Calmedica" },
  ]
}

export default function Index() {
  return <div className="w-full min-h-screen h-10 p-16 flex flex-col gap-4">
    <h1 className="font-bold text-4xl">Feedbacks</h1>
    <div className="flex items-center">
      
    </div>
  </div>
}

