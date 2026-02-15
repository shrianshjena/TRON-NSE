'use client';

import { useStockData } from '@/hooks/use-stock-data';
import { formatINR, formatMarketCap, formatPercent } from '@/lib/utils/format';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ReferenceLine,
} from 'recharts';

// ---------- Chart Tooltip ----------

function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;

    return (
        <div className="p-2 rounded bg-tron-bg-card border border-tron-orange/30 text-xs shadow-lg"
            style={{ boxShadow: '0 0 12px rgba(255,106,0,0.2)' }}
        >
            <p className="font-mono text-tron-text-secondary mb-1">{label}</p>
            {payload.map((entry: any, i: number) => (
                <p key={i} className="font-mono text-tron-text-primary">
                    {entry.name}: {entry.name.includes('Revenue') ? formatMarketCap(entry.value) : formatINR(entry.value)}
                </p>
            ))}
        </div>
    );
}

// ---------- EPS Chart ----------

function EPSChart({ quarters }: { quarters: any[] }) {
    if (!quarters?.length) return null;

    const data = [...quarters].reverse().map((q: any) => ({
        quarter: q.quarter,
        estimate: q.epsEstimate,
        actual: q.epsActual,
        beat: q.epsActual != null && q.epsEstimate != null ? q.epsActual >= q.epsEstimate : null,
        surprise: q.epsSurprise,
    }));

    return (
        <div>
            <h3 className="font-heading text-sm text-tron-orange mb-3 tracking-wider">
                EARNINGS PER SHARE (EPS)
            </h3>
            <div className="rounded-lg bg-tron-bg-card border border-tron p-4">
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={data} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,106,0,0.08)" />
                        <XAxis
                            dataKey="quarter"
                            tick={{ fill: '#8888a0', fontSize: 11, fontFamily: "'Share Tech Mono', monospace" }}
                            axisLine={{ stroke: 'rgba(255,106,0,0.15)' }}
                        />
                        <YAxis
                            tick={{ fill: '#8888a0', fontSize: 11, fontFamily: "'Share Tech Mono', monospace" }}
                            axisLine={{ stroke: 'rgba(255,106,0,0.15)' }}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <ReferenceLine y={0} stroke="rgba(255,106,0,0.2)" />
                        <Bar dataKey="estimate" name="EPS Estimate" fill="rgba(255,106,0,0.25)" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="actual" name="EPS Actual" radius={[2, 2, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.beat === true ? '#22c55e' : entry.beat === false ? '#ef4444' : '#FF6A00'}
                                    style={{ filter: `drop-shadow(0 0 4px ${entry.beat === true ? 'rgba(34,197,94,0.3)' : entry.beat === false ? 'rgba(239,68,68,0.3)' : 'rgba(255,106,0,0.3)'})` }}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-2 text-[10px]">
                    <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-sm bg-tron-orange/25" /> Estimate
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-sm bg-green-500" /> Beat
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-sm bg-red-500" /> Miss
                    </span>
                </div>
            </div>
        </div>
    );
}

// ---------- Revenue Chart ----------

function RevenueChart({ quarters }: { quarters: any[] }) {
    if (!quarters?.length) return null;

    const data = [...quarters].reverse().map((q: any) => ({
        quarter: q.quarter,
        estimate: q.revenueEstimate,
        actual: q.revenueActual,
        beat: q.revenueActual != null && q.revenueEstimate != null ? q.revenueActual >= q.revenueEstimate : null,
        surprise: q.revenueSurprise,
    }));

    return (
        <div className="mt-6">
            <h3 className="font-heading text-sm text-tron-orange mb-3 tracking-wider">
                QUARTERLY REVENUE
            </h3>
            <div className="rounded-lg bg-tron-bg-card border border-tron p-4">
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={data} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,106,0,0.08)" />
                        <XAxis
                            dataKey="quarter"
                            tick={{ fill: '#8888a0', fontSize: 11, fontFamily: "'Share Tech Mono', monospace" }}
                            axisLine={{ stroke: 'rgba(255,106,0,0.15)' }}
                        />
                        <YAxis
                            tick={{ fill: '#8888a0', fontSize: 11, fontFamily: "'Share Tech Mono', monospace" }}
                            axisLine={{ stroke: 'rgba(255,106,0,0.15)' }}
                            tickFormatter={(value: number) => {
                                if (value >= 1e7) return `${(value / 1e7).toFixed(0)} Cr`;
                                if (value >= 1e5) return `${(value / 1e5).toFixed(0)} L`;
                                return value.toString();
                            }}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="estimate" name="Revenue Estimate" fill="rgba(255,106,0,0.25)" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="actual" name="Revenue Actual" radius={[2, 2, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.beat === true ? '#22c55e' : entry.beat === false ? '#ef4444' : '#FF6A00'}
                                    style={{ filter: `drop-shadow(0 0 4px ${entry.beat === true ? 'rgba(34,197,94,0.3)' : entry.beat === false ? 'rgba(239,68,68,0.3)' : 'rgba(255,106,0,0.3)'})` }}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ---------- Quarterly Breakdown Table ----------

function QuarterlyTable({ quarters }: { quarters: any[] }) {
    if (!quarters?.length) return null;

    return (
        <div className="mt-6">
            <h3 className="font-heading text-sm text-tron-orange mb-3 tracking-wider">
                QUARTERLY BREAKDOWN
            </h3>
            <div className="overflow-x-auto rounded-lg border border-tron">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="bg-tron-bg-card">
                            <th className="text-left px-3 py-2 text-tron-text-secondary font-heading border-b border-tron">Quarter</th>
                            <th className="text-right px-3 py-2 text-tron-text-secondary font-heading border-b border-tron">EPS Est.</th>
                            <th className="text-right px-3 py-2 text-tron-text-secondary font-heading border-b border-tron">EPS Act.</th>
                            <th className="text-right px-3 py-2 text-tron-text-secondary font-heading border-b border-tron">Surprise</th>
                            <th className="text-right px-3 py-2 text-tron-text-secondary font-heading border-b border-tron">Rev. Est.</th>
                            <th className="text-right px-3 py-2 text-tron-text-secondary font-heading border-b border-tron">Rev. Act.</th>
                            <th className="text-right px-3 py-2 text-tron-text-secondary font-heading border-b border-tron">Surprise</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quarters.map((q: any, i: number) => {
                            const epsBeat = q.epsActual != null && q.epsEstimate != null ? q.epsActual >= q.epsEstimate : null;
                            const revBeat = q.revenueActual != null && q.revenueEstimate != null ? q.revenueActual >= q.revenueEstimate : null;

                            return (
                                <tr key={i} className="border-b border-tron/30 hover:bg-tron-bg-card/50 transition-colors">
                                    <td className="px-3 py-2 font-mono text-tron-text-primary whitespace-nowrap">{q.quarter}</td>
                                    <td className="text-right px-3 py-2 font-mono text-tron-text-secondary">{formatINR(q.epsEstimate)}</td>
                                    <td className={`text-right px-3 py-2 font-mono ${epsBeat === true ? 'text-tron-green' : epsBeat === false ? 'text-tron-red' : 'text-tron-text-primary'}`}>
                                        {formatINR(q.epsActual)}
                                    </td>
                                    <td className={`text-right px-3 py-2 font-mono ${q.epsSurprise > 0 ? 'text-tron-green' : q.epsSurprise < 0 ? 'text-tron-red' : 'text-tron-text-secondary'}`}>
                                        {q.epsSurprise != null ? `${q.epsSurprise > 0 ? '+' : ''}${q.epsSurprise.toFixed(1)}%` : '--'}
                                    </td>
                                    <td className="text-right px-3 py-2 font-mono text-tron-text-secondary">{formatMarketCap(q.revenueEstimate)}</td>
                                    <td className={`text-right px-3 py-2 font-mono ${revBeat === true ? 'text-tron-green' : revBeat === false ? 'text-tron-red' : 'text-tron-text-primary'}`}>
                                        {formatMarketCap(q.revenueActual)}
                                    </td>
                                    <td className={`text-right px-3 py-2 font-mono ${q.revenueSurprise > 0 ? 'text-tron-green' : q.revenueSurprise < 0 ? 'text-tron-red' : 'text-tron-text-secondary'}`}>
                                        {q.revenueSurprise != null ? `${q.revenueSurprise > 0 ? '+' : ''}${q.revenueSurprise.toFixed(1)}%` : '--'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ---------- Earnings Tab ----------

function EarningsTab({ ticker }: { ticker: string }) {
    const { data, loading, error } = useStockData<any>(
        `/api/stock/${ticker}/earnings`
    );

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-[300px] bg-tron-bg-card rounded-lg" />
                <div className="h-[300px] bg-tron-bg-card rounded-lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center rounded-lg bg-tron-bg-card border border-tron">
                <p className="text-sm text-tron-red mb-2">{error}</p>
                <p className="text-xs text-tron-text-secondary">Unable to load earnings data.</p>
            </div>
        );
    }

    const quarters = data?.quarters ?? [];

    return (
        <div>
            <EPSChart quarters={quarters} />
            <RevenueChart quarters={quarters} />
            <QuarterlyTable quarters={quarters} />
        </div>
    );
}

export default EarningsTab;
