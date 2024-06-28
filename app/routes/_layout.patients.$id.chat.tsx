import { LoaderFunctionArgs, json, type MetaFunction } from "@remix-run/node";
import { Await,  useFetcher, useLoaderData, useOutletContext } from "@remix-run/react";
import { Suspense, useEffect, useState } from "react";
import { TYPES } from "~/core.server/infrastructure";
import { container } from "~/core.server/inversify.config";
import { IPatientRepository } from "~/core.server/repositories/patient.repository";
import { Subscriptions } from "./_layout";
import { action } from "./_layout.patients.$id.anonymize";

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
    patient,

  })
}

export const meta: MetaFunction = () => {
  return [
    { title: "Patients | Calmedica" },
  ];
};

export default function Index() {
  const subscriptions = useOutletContext<{
    subscriptions: Subscriptions,
    addSubscription: (id: string, cb: () => void) =>void
  }>()
  const fetcher = useFetcher<typeof action>()
  const { patient } = useLoaderData<typeof loader>()
  const [ loading, setLoading ] = useState(false)


  useEffect(() => {
    if (fetcher.data) {
      setLoading(true)
      subscriptions.addSubscription(fetcher.data.id, () => setLoading(false))
    }
  }, [fetcher.data])


  return <div className="flex-1 p-12 flex items-stretch justify-stretch gap-12">
      <div className="flex-1 bg-[#f9faff] shadow-lg rounded-md p-8 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="tracking-wider text-xl font-bold">Chat</h1>
          <fetcher.Form method="POST" action={`/patients/${patient.id}/thematize`}>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md" type="submit">Analyser</button>
          </fetcher.Form>
          <fetcher.Form method="POST" action={`/patients/${patient.id}/anonymize`}>
            <button className="px-4 py-2 bg-[#fb4f14] text-white rounded-md shadow-md" disabled={fetcher.state === 'submitting' || loading}>{fetcher.state !== 'submitting' && !loading ? 'Export' : 'Exporting...'}</button>
          </fetcher.Form>
        </div>
        
        <Suspense fallback={<div>Loading...</div>}>
          <Await resolve={patient}>
            {(patient) =>  <ul className="flex flex-col gap-2">
              { patient.messages.map(({ content, fromUser, theme }) => {
                return (
                  <li className={`p-2 rounded-lg shadow-xl max-w-[80%] ${fromUser ? "self-end" : "text-black bg-[#ff8b64]"}`} key={content}>
                    <p>{content}</p>
                    <p className="bg-blue-500 text-white px-2 py-1 rounded-md w-50">{theme}</p>
                  </li>
                );
                    })
                  }
                </ul>
              }
          </Await>
        </Suspense>
      </div>
    </div>
}


export function ErrorBoundary() {
  return <div className="w-full h-full flex flex-col gap-4 items-center justify-center">
  <h1 className="text-4xl font-bold">The Chat could not load</h1>
  <span className="text-xl">Please try again later</span>
  
</div>
}