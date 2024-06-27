import { FetcherWithComponents, Form } from "@remix-run/react";

export interface DataRowProps {
    id: number,
    question: string,
    reponse: number,
    note: number,
    fetcher: FetcherWithComponents<any>
}

// eslint-disable-next-line react/prop-types
export const DataRow: React.FC<DataRowProps> = ({ id, question, reponse, note, fetcher }) => {
    return (
        <div className="flex flex-col gap-2">
            {note && fetcher.state !== "loading" && fetcher.state !== "submitting" ? (
                <div className="rounded-lg flex flex-col w-full bg-white shadow-xl p-8 gap-4">
                    <h1>{fetcher.formData}</h1>
                    <span className="w-4/6 rounded-lg flex bg-green shadow-xl p-6">
                        {question}
                    </span>
                    <span className="w-4/6 rounded-lg flex self-end bg-green-400 text-white shadow-xl p-6">
                        {reponse}
                    </span>
                    <span className="w-min flex flex-col self-center">
                        <span className="w-min h-min rounded-lg flex bg-blue-600 text-base text-white text-center shadow-xl p-4">
                            {note}
                        </span>
                    </span>
                    <fetcher.Form method="POST" className="flex flex-col self-end">
                        <input type="hidden" name="id" value={id} />
                        <input type="hidden" name="note" value={note} />
                        <button>Regénérer la note</button>
                    </fetcher.Form>
                </div>
            ) : null}
            {fetcher.state ==="loading" || fetcher.state ==="submitting" ? (
                <div className="rounded-lg flex flex-col w-full bg-white shadow-xl p-8 gap-4">
                    Chargement...
                </div>
            ) : null}
        </div>
    );
}
