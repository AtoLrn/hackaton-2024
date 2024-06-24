import { json, type MetaFunction } from "@remix-run/node";
import { ErrorLoadingTooEarly } from "~/core.server/errors";
import { TYPES } from "~/core.server/infrastructure";
import { container } from "~/core.server/inversify.config";
import { Iollama } from "~/core.server/services/ollama.service";

export const loader = async () => {
  const ollamaService = container.get<Iollama>(TYPES.OllamaService)

  try {
    const results = await ollamaService.fetchFeedbacks()
    return json({
      results
    })
  } catch (e) {
    if (e instanceof ErrorLoadingTooEarly) {
      throw new Response(undefined, { status: 404 })
    }

    throw new Response(undefined, { status: 500 })
  }
}

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard | Calmedica" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return <div className="w-full min-h-screen h-10 p-8 flex flex-col gap-4">
    <h1 className="font-bold text-4xl">Patients</h1>
    <div className="flex items-center">
      <span className="p-12 pb-8 shadow-xl rounded-xl text-white font-bold text-xl triangle bg-[#fb4f14] flex flex-col items-center justify-end  gap-2">
        <span>12</span>
        <span>Urgences</span>
      </span>
    </div>
  </div>
}

