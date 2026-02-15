'use client';

import { useState } from 'react';
import { useStockData } from '@/hooks/use-stock-data';
import { formatINR, formatPercent, formatNumber, formatMarketCap } from '@/lib/utils/format';

type Period = 'annual' | 'quarterly' | 'ttm';

function PeriodToggle({ active, onChange }: { active: Period; onChange: (p: Period) => void }) {
    const periods: { id: Period; label: string }[] = [
        { id: 'annual', label: 'Annual' },
        { id: 'quarterly', label: 'Quarterly' },
        { id: 'ttm', label: 'TTM' },
    ];

    return (
        <div className="flex gap-1 mb-4">
            {periods.map((p) => (
                <button
                    key={p.id}
                    onClick={() => onChange(p.id)}
                    className={`px-3 py-1.5 text-xs font-heading tracking-wider rounded transition-all ${active === p.id
                            ? 'bg-tron-orange text-black shadow-tron-glow'
                            : 'bg-tron-bg-card text-tron-text-secondary hover:text-tron-text-primary border border-tron'
                        }`}
                >
                    {p.label}
                </button>
            ))}
        </div>
    );
}

function formatCellValue(label: string, value: number | null): string {
    if (value === null || value === undefined) return '--';

    const lowerLabel = label.toLowerCase();

    // Percentage fields
    if (lowerLabel.includes('%') || lowerLabel.includes('margin') || lowerLabel.includes('return') || lowerLabel.includes('growth')) {
        return `${value.toFixed(2)}%`;
    }

    // Ratio fields
    if (lowerLabel.includes('ratio') || lowerLabel.includes('debt to equity') || lowerLabel.includes('current ratio')) {
        return value.toFixed(2);
    }

    // EPS fields
    if (lowerLabel.includes('eps')) {
        return formatINR(value);
    }

    // Large monetary values
    if (Math.abs(value) >= 1e7) {
        return formatMarketCap(value);
    }

    return formatNumber(value);
}

function FinancialTable({
    dates,
    rows,
}: {
    dates: string[];
    rows: { label: string; values: Record<string, number | null> }[];
}) {
    if (!dates?.length || !rows?.length) {
        return (
            <div className="p-6 text-center text-sm text-tron-text-secondary">
                No financial data available.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-tron">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-tron-bg-card">
                        <th className="sticky left-0 bg-tron-bg-card z-10 text-left px-3 py-2 text-xs font-heading text-tron-orange tracking-wider border-b border-tron">
                            Metric
                        </th>
                        {dates.map((date) => (
                            <th
                                key={date}
                                className="text-right px-3 py-2 text-xs font-mono text-tron-text-secondary border-b border-tron whitespace-nowrap"
                            >
                                {date}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => {
                        const isSection = row.label.endsWith('%') === false &&
                            ['Revenue', 'Gross Profit', 'Operating Income', 'Net Income', 'EBITDA', 'Total Assets', 'Total Equity', 'Operating Cash Flow'].includes(row.label);

                        return (
                            <tr
                                key={i}
                                className={`border-b border-tron/30 hover:bg-tron-bg-card/50 transition-colors ${isSection ? 'bg-tron-bg-secondary/30' : ''
                                    }`}
                            >
                                <td className="sticky left-0 bg-tron-bg-primary z-10 px-3 py-2 text-xs text-tron-text-primary whitespace-nowrap font-mono">
                                    {row.label}
                                </td>
                                {dates.map((date) => {
                                    const val = row.values[date];
                                    return (
                                        <td key={date} className="text-right px-3 py-2 text-xs font-mono text-tron-text-primary whitespace-nowrap">
                                            {formatCellValue(row.label, val ?? null)}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function FinancialsTab({ ticker }: { ticker: string }) {
    const [period, setPeriod] = useState<Period>('annual');
    const { data, loading, error } = useStockData<any>(
        `/api/stock/${ticker}/financials?period=${period}`
    );

    if (loading) {
        return (
            <div className="space-y-3 animate-pulse">
                <div className="h-8 w-48 bg-tron-bg-card rounded" />
                <div className="h-[400px] bg-tron-bg-card rounded-lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center rounded-lg bg-tron-bg-card border border-tron">
                <p className="text-sm text-tron-red mb-2">{error}</p>
                <p className="text-xs text-tron-text-secondary">Unable to load financial data.</p>
            </div>
        );
    }

    return (
        <div>
            <PeriodToggle active={period} onChange={setPeriod} />
            <FinancialTable dates={data?.dates ?? []} rows={data?.rows ?? []} />
            {data?.currency && (
                <p className="text-[10px] text-tron-text-secondary/50 mt-2">
                    All values in {data.currency}.
                </p>
            )}
        </div>
    );
}

export default FinancialsTab;
