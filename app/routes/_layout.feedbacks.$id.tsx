// import { BarChart } from "@mui/x-charts";
import { Chart } from 'chart.js/auto';
import { LoaderFunctionArgs, json, type MetaFunction } from "@remix-run/node";
import { Kpi } from "~/components/kpi";
import { useEffect, useRef, useState } from 'react';
import { NavLink, useLoaderData } from '@remix-run/react';
import { TYPES } from "~/core.server/infrastructure";
import { container } from "~/core.server/inversify.config";
import { IDataRepository } from '~/core.server/repositories/data.repository';

export const meta: MetaFunction = () => {
  return [
    { title: "Feedbacks | Calmedica" },
  ]
}

export const loader = async ({params}: LoaderFunctionArgs) => {
  const dataRepository = container.get<IDataRepository>(TYPES.DataRepository)

  const id = params['id']
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

  const dataList = await dataRepository.getDataByTheme(theme)

  return json({
    dataList
  })
}

export default function Index() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const unsureCanvas = useRef<HTMLCanvasElement>(null)
  const { dataList } = useLoaderData<typeof loader>()
  const [noteAverage, setNoteAverage] = useState<number>(0)
  const [consistency, setConsistency] = useState<number>(0)

  useEffect(() => {
    let globalScore = 0;
    let unconsistentAnswers = 0

    for (let i = 0; i < dataList.length; i++){
      globalScore += dataList[i].note
      if (dataList[i].themeReponseId !== dataList[i].themeQuestionId) {
        unconsistentAnswers += 1
      }
    }

    setNoteAverage(Math.floor((globalScore / dataList.length) * 10))
    setConsistency(Math.floor(100 * unconsistentAnswers / dataList.length))
  })

  useEffect(() => {
    if (!canvas.current) {
      return
    }

    const chart = new Chart(canvas.current, {
      type: 'bar',
      data: {
        datasets: [{
          data: [20, 10],
        }],
        labels: ['a', 'b']
      },
      options: {
        maintainAspectRatio: false,
        responsive: true
    }
    })

    return () => {
      chart.destroy()
    }
  }, [canvas]) 
  
  useEffect(() => {
    if (!unsureCanvas.current) {
      return
    }

    const chart = new Chart(unsureCanvas.current, {
      type: 'bar',
      data: {
        datasets: [{
          data: [20, 10],
        }],
        labels: ['a', 'b']
      },
      options: {
        maintainAspectRatio: false,
        responsive: true
    }
    })

    return () => {
      chart.destroy()
    }
  }, [unsureCanvas]) 
  

  return <div className="w-full h-screen overflow-scroll p-16">
    <div className='flex flex-col gap-8'>

    <h1 className="font-bold text-4xl"></h1>
    <div className="flex justify-center gap-4">
      <NavLink to={'/feedbacks/sante'} className="rounded-lg shadow-xl bg-white p-4">
        Santé
      </NavLink>
      <NavLink to={'/feedbacks/satisfaction'} className="rounded-lg shadow-xl bg-white p-4">
        Satisfaction
      </NavLink>
      <NavLink to={'/feedbacks/information'} className="rounded-lg shadow-xl bg-white p-4">
        Informations
      </NavLink>
    </div>
    <div className="flex justify-center items-center gap-16">
      <Kpi
        name="Indice de satisfaction"
        rate={noteAverage}
        progress={0.0102}
      />
      <Kpi
        name="Pourcentage inexploitable"
        rate={consistency}
      />
    </div>
    
    <div className="rounded-lg flex flex-col w-full bg-white shadow-xl p-12">
      <h3 className="font-bold text-2xl">Completions Rate</h3>
      <canvas className='h-96 max-h-96' ref={canvas} id='chart-completions-rate'></canvas>
    </div>
    <div className="rounded-lg flex flex-col w-full bg-white shadow-xl p-12">
    <h3 className="font-bold text-2xl">Unsure Answer Rate</h3>
      <canvas className='h-96 max-h-96' ref={unsureCanvas} id='chart-completions-rate'></canvas>
    </div>
    </div>
  </div>
}

