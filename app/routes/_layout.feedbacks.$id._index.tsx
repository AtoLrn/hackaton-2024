// import { BarChart } from "@mui/x-charts";
import { Chart } from 'chart.js/auto';
import { getRelativePosition } from 'chart.js/helpers';
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
    dataList,
    theme: id
  })
}

export default function Index() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const unsureCanvas = useRef<HTMLCanvasElement>(null)
  const { dataList, theme } = useLoaderData<typeof loader>()
  const [noteAverage, setNoteAverage] = useState<number>(0)
  const [consistency, setConsistency] = useState<number>(0)

  useEffect(() => {
    let globalScore = 0;
    let consistentAnswers = 0

    for (let i = 0; i < dataList.length; i++){
      globalScore += dataList[i].note
      if (dataList[i].themeReponseId === dataList[i].themeQuestionId && dataList[i].exploitable) {
        consistentAnswers += 1
      }
    }

    setNoteAverage(Math.floor((globalScore / dataList.length) * 10))
    setConsistency(Math.floor(100 * consistentAnswers / dataList.length))
  })

  useEffect(() => {
    const data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    for (let i = 0; i < dataList.length; i++){
      data[dataList[i].note - 1]++
    }

    if (!canvas.current) {
      return
    }

    const chart = new Chart(canvas.current, {
      type: 'bar',
      data: {
        datasets: [{
          label: "Nombre d'avis",
          data: data,
        }],
        labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        onClick: (e) => {
          const canvasPosition = getRelativePosition(e, chart);

          const dataX = chart.scales.x.getValueForPixel(canvasPosition.x)+1;

          if (typeof dataX === 'number') {
            document.location.href = `/feedbacks/${theme}/${dataX}`
          }
        }
    }
    })

    return () => {
      chart.destroy()
    }
  }) 
  
  useEffect(() => {
    const data = [0, 0, 0]
    for (let i = 0; i < dataList.length; i++){
      if(!dataList[i].exploitable) {
        data[2]++
      } else if(dataList[i].themeQuestionId != dataList[i].themeReponseId) {
        data[1]++
      } else {
        data[0]++
      }
    }

    if (!unsureCanvas.current) {
      return
    }

    const chart = new Chart(unsureCanvas.current, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: data,
          backgroundColor: [
            'rgb(0, 128, 0)',
            'rgb(0, 0, 255)',
            'rgb(255, 0, 0)',
          ]
        }],
        labels: ['exploitables', 'sans lien', 'inexploitables'],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true
    }
    })

    return () => {
      chart.destroy()
    }
  }) 
  

  return <div className="w-full h-screen overflow-scroll p-16">
    <div className='flex flex-col gap-8'>

    <h1 className="font-bold text-4xl">{theme}</h1>
    <div className="flex justify-center gap-4">
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
    <div className="flex justify-center items-center gap-16">
      {theme === "sante" || theme === "satisfaction" ?<Kpi
        name="Indice de satisfaction"
        rate={noteAverage}
        progress={0.0102}
      /> : null}
      <Kpi
        name="Pourcentage de réponses exploitables"
        rate={consistency}
      />
    </div>
    
    {theme === "sante" || theme === "satisfaction" ?
    <div className="rounded-lg flex flex-col w-full bg-white shadow-xl p-12">
      <h3 className="font-bold text-2xl">Indice de satisfaction</h3>
      <canvas className='h-96 max-h-96' ref={canvas} id='chart-completions-rate'></canvas>
    </div>: null}
    <div className="rounded-lg flex flex-col w-full bg-white shadow-xl p-12">
    <h3 className="font-bold text-2xl">Lien entre la question et la réponse</h3>
      <canvas className='h-96 max-h-96' ref={unsureCanvas} id='chart-completions-rate'></canvas>
    </div>
    </div>
  </div>
}

