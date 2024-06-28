import { json, type MetaFunction } from "@remix-run/node";
import { NavLink, useLoaderData } from '@remix-run/react';
import { Chart } from 'chart.js/auto';
import { useEffect, useRef } from "react";
import { EventType } from "~/core.server/entities/event.entity";
import { TYPES } from "~/core.server/infrastructure";
import { container } from "~/core.server/inversify.config";
import { IEventRepository } from "~/core.server/repositories/event.repository";

export const loader = async () => {
  const eventRepository = container.get<IEventRepository>(TYPES.EventRepository)

  const events = await eventRepository.getAll()

  const repartitions = events.filter(e => e.type === EventType.CANCEL).reduce<Record<string, number>>((acc,val) => {
    const operationEvent = events.find(oe => oe.id === val.operationId)

    if (!operationEvent) {
      return acc
    }

    const diff = operationEvent.date.getTime() - val.date.getTime()

    const day = Math.round(diff / (1000 * 3600 * 24))

    
    if (`${day}` in acc) {
      acc[`${day}`] = acc[`${day}`] + 1
    } else {
      acc[`${day}`]  = 1
    }
    
    return acc
  }, {})

  const diseases = events.filter(e => e.type === EventType.DISEASE).reduce<Record<string, { disease: string, count: number }[]>>((acc, val) => {
    const key = val.date.getMonth()
    
    if (key in acc) {
      const disease = acc[key].find(d => d.disease === val.disease!)

      if (!disease) {
        acc[key].push({
          disease: val.disease!,
          count: 1
        })
      } else {
        disease.count = disease?.count + 1

      }
    } else {
      acc[key] = [{
        disease: val.disease!,
        count: 1
      }]
    }

    return acc
  },{})

  return json({
    repartitions,
    diseases
  })
}

export const meta: MetaFunction = () => {
  return [
    { title: "Simulation | Calmedica" },
  ]
}

const months = [
  'Janvier',
  'Fevrier',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Aout',
  'Septembre',
  'Octobre',
  'Novembre',
  'Decembre',
] 

export default function Index() {
  const { repartitions, diseases } = useLoaderData<typeof loader>()
  const canvas = useRef<HTMLCanvasElement>(null)
  const canvasDiseases = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    if (!canvas.current) {
      return
    }

    const chart = new Chart(canvas.current, {
      type: 'bar',
      data: {
        datasets: [{
          label: "Nombre de jours",
          data: Object.values(repartitions),
        }],
        labels: Object.keys(repartitions).map(s => `${s} jour(s)`),
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
      }
    })

    return () => {
      chart.destroy()
    }
  }, []) 

  useEffect(() => {
    if (!canvasDiseases.current) {
      return
    }

    const diseasesType = Object.values(diseases).reduce<Array<string>>((acc, val) => {
      const diseasesTypes = val.map(v => v.disease)

      diseasesTypes.forEach((d) => {
        if (!acc.includes(d)) {
          acc.push(d) 
        }
      })

      return acc
    }, [])

    const chart = new Chart(canvasDiseases.current, {
      type: 'bar',
      data: {
        datasets: diseasesType.map((type) => {
          
          return {
            label: type,
            stack: 'onTop',
            data: Object.entries(diseases).reduce<Array<number>>((acc, val) => {
              const count = val[1].find(e => e.disease === type)?.count ?? 0
              return [
                ...acc,
                count
              ]
          }, [])
          }
        }),
        // datasets: [{
        //   label: "Nombre d'avis",
        //   data: Object.values(repartitions),
        // }],
        labels: Object.keys(diseases).map(s => months[parseInt(s)]),
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
      }
    })

    return () => {
      chart.destroy()
    }
  }, []) 
  
  return <div className="w-full h-screen overflow-scroll p-16">
    <div className='flex flex-col gap-8'>

    <h1 className="font-bold text-4xl">Simulation</h1>
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
    <div className="rounded-lg flex flex-col w-full bg-white shadow-xl p-12">
      <h3 className="font-bold text-2xl">Difference entre le jour de l'operation et l'annulation</h3>
      <canvas className='h-96 max-h-96' ref={canvas}  id='chart-day-cancellation'></canvas>
    </div>
    <div className="rounded-lg flex flex-col w-full bg-white shadow-xl p-12">
      <h3 className="font-bold text-2xl">Maladies</h3>
      <canvas className='h-96 max-h-96' ref={canvasDiseases}  id='chart-diseas'></canvas>
    </div>
    </div>
  </div>
}

