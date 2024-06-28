import { ActionFunctionArgs, LoaderFunctionArgs, json, type MetaFunction } from "@remix-run/node";
import toast, { Toaster } from 'react-hot-toast';
import { useEffect, useRef, useState } from 'react';
import { NavLink, useFetcher, useLoaderData } from '@remix-run/react';
import { TYPES } from "~/core.server/infrastructure";
import { container } from "~/core.server/inversify.config";
import { IDataRepository } from '~/core.server/repositories/data.repository';
import { DataRow } from "~/components/dataRow";
import { Iollama } from "~/core.server/services/ollama.service";


export const meta: MetaFunction = () => {
  return [
    { title: "Feedbacks details | Calmedica" },
  ]
}

export const loader = async ({params}: LoaderFunctionArgs) => {
    const dataRepository = container.get<IDataRepository>(TYPES.DataRepository)

    const id = params['id'] as string
    const note = params['note'] as string
    let theme;

    switch (id) {
      case "sante":
        theme = "HEALTH"
        break
      case "satisfaction":
        theme = "SATISFACTION"
        break
      case "information":
        theme = "INFORMATION"
        break
      default:
        theme = "OTHER"
    }

    const dataList = await dataRepository.getDataByThemeByNote(theme, parseInt(note))

    return json({
        dataList,
        theme: id,
    })
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const dataRepository = container.get<IDataRepository>(TYPES.DataRepository)
  const ollamaService = container.get<Iollama>(TYPES.OllamaService)

  const body = await request.formData()

  const id = parseInt(body.get('id'))
  const note = body.get('note')

  const data = await dataRepository.getDataById(id)
  const theme = await dataRepository.getThemeByDataId(data.themeReponseId)
  let updatedData = null;

  switch (theme) {
    case "HEALTH":
      updatedData = await ollamaService.refetchHealthIndicatorFromFeedback(data, parseInt(note))
      break
    case "SATISFACTION":
      updatedData = await ollamaService.refetchSatisfactionIndicatorFromFeedback(data, parseInt(note))
      break
    default:
      break
  }

  toast.success('Nouvel indicateur généré avec succès ! Valeur : ' + note)

  return json({
    updatedData
  })
}

export default function Index() {
  const { dataList, theme } = useLoaderData<typeof loader>()

  return <div className="w-full h-screen overflow-scroll p-16">
    <div className='flex flex-col gap-8'>
      <div className="block absolute top-0 right-0">
        <h1>CACA</h1>
        <Toaster />
      </div>
      <div className="flex justify-center gap-4">
        <NavLink to={`/feedbacks/${theme}`} className="rounded-lg shadow-xl bg-white p-4">
          Retour aux statistiques
        </NavLink>
      </div>
      <div className="flex flex-col gap-4">
        {dataList.map((data) => {
          return <DataRow
            id={data.id}
            question={data.question}
            reponse={data.reponse}
            note={data.note}
          />
        })}
      </div>
    </div>
  </div>
}