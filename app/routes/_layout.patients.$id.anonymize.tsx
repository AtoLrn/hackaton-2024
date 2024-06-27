import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Message } from "~/core.server/entities/message.entity";
import { Patient } from "~/core.server/entities/patient.entity";
import { TYPES } from "~/core.server/infrastructure";
import { container } from "~/core.server/inversify.config";
import { IPatientRepository } from "~/core.server/repositories/patient.repository";
import { IOffuscateService } from "~/core.server/services/offuscate.service";
import { IQueueService } from "~/core.server/services/queue.service";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const queueService = container.get<IQueueService<Promise<Patient>>>(TYPES.QueueService)
  
  const responseStream = new TransformStream()
	const writer = responseStream.writable.getWriter()
	const encoder = new TextEncoder()

	// Send Keep Alive Message
	const interval = setInterval(() => {
		writer.write(encoder.encode(':keepalive\n\n'))
	}, 5_000)
  
  
  const id = params['id']

  if (!id) {
    throw new Response(undefined, {
      status: 404
    })
  }

  const promise =  queueService.get(id)

	if (!promise) {
		return new Response(undefined, { status: 404 })
	}

  promise.then(async (p) => {
		await writer.write(encoder.encode('data: ' + JSON.stringify(p) + '\n\n'))

  }).finally(() => {
		clearInterval(interval)
		writer.close()
  })


  return new Response(responseStream.readable, {
		status: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Content-Type': 'text/event-stream; charset=utf-8',
			'Connection': 'keep-alive',
			'Cache-Control': 'no-cache, no-transform',
			'X-Accel-Buffering': 'no',
			'Content-Encoding': 'none',
		},
	})
}


export const action = async ({ params }: ActionFunctionArgs) => {
  const patientRepository = container.get<IPatientRepository>(TYPES.PatientRepository)
  const offuscateService = container.get<IOffuscateService>(TYPES.OffuscateService)
  const queueService = container.get<IQueueService<Promise<Patient>>>(TYPES.QueueService)

  
  
  const id = params['id']

  if (!id) {
    throw new Response(undefined, {
      status: 404
    })
  }



  const patient = await patientRepository.getById(parseInt(id))

  const patientAnonymized = new Promise<Patient>((resolve) => {
    Promise.all(patient.messages.map(async ({ content, fromUser }) => {
      return new Message(
        await offuscateService.offuscate(patient, content),
        fromUser
      )
    })).then((messages) => {
      resolve({
        ...patient,
        messages: messages
      })
    })
  })

  const promiseId =  queueService.create(patientAnonymized)

  return json({
    id: promiseId
  })
}
