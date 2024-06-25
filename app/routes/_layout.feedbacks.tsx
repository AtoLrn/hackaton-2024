// import { BarChart } from "@mui/x-charts";
import { Chart } from 'chart.js/auto';
import { type MetaFunction } from "@remix-run/node";
import { Kpi } from "~/components/kpi";
import { useEffect, useRef } from 'react';

export const meta: MetaFunction = () => {
  return [
    { title: "Feedbacks | Calmedica" },
  ]
}

export default function Index() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const unsureCanvas = useRef<HTMLCanvasElement>(null)
  
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

    <h1 className="font-bold text-4xl">Feedbacks</h1>
    <div className="flex items-center gap-4">
      <div className="rounded-lg shadow-xl bg-white p-4">
        From 12. Dec to 19. Dec
      </div>
      <div className="rounded-lg shadow-xl bg-white p-4">
        Weekly
      </div>
    </div>
    <div className="flex items-center gap-16">
      <Kpi
        name="Open rate"
        rate={0.7}
        progress={0.0102}
      />
      <Kpi
        name="Click rate"
        rate={0.23}
        progress={-0.012}
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

