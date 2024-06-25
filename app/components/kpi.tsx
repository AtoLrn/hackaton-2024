export interface KpiProps {
    name: string,
    rate: number,
    progress: number,
}

// eslint-disable-next-line react/prop-types
export const Kpi: React.FC<KpiProps> = ({ name, rate, progress }) => {
    return <div className="flex flex-col gap-2">
        <h1 className="text-lg text-gray-800">{name}</h1>
        <h2 className="text-8xl font-bold">{rate * 100}%</h2>
        <div className="flex items-center gap-2">
            <h2 className={`font-bold ${progress > 0 ? 'text-green-700' : 'text-red-700'}` }>{progress > 0 ? '↗' : '↘' }{progress * 100}%</h2>
            <span>Since last week</span>
        </div>
    </div>
}