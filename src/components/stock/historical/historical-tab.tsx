'use client';

import { useState } from 'react';
import { useStockData } from '@/hooks/use-stock-data';
import { formatINR, formatVolume, formatDate } from '@/lib/utils/format';
import type { HistoricalRange } from '@/lib/types/financial';

const RANGES: { id: HistoricalRange; label: string }[] = [
    { id: '1D', label: '1D' },
    { id: '5D', label: '5D' },
    { id: '1M', label: '1M' },
    { id: '6M', label: '6M' },
    { id: 'YTD', label: 'YTD' },
    { id: '1Y', label: '1Y' },
    { id: '5Y', label: '5Y' },
    { id: 'MAX', label: 'MAX' },
];

type SortKey = 'date' | 'open' | 'high' | 'low' | 'close' | 'volume';
type SortDir = 'asc' | 'desc';

function HistoricalTab({ ticker }: { ticker: string }) {
    const [range, setRange] = useState<HistoricalRange>('1M');
    const [sortKey, setSortKey] = useState<SortKey>('date');
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    const { data, loading, error } = useStockData<any>(
        `/api/stock/${ticker}/historical?range=${range}`
    );

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir(key === 'date' ? 'desc' : 'desc');
        }
    };

    const rawData: any[] = data?.data ?? [];
    const sortedData = [...rawData].sort((a, b) => {
        let cmp = 0;
        if (sortKey === 'date') {
            cmp = a.date.localeCompare(b.date);
        } else {
            cmp = (a[sortKey] ?? 0) - (b[sortKey] ?? 0);
        }
        return sortDir === 'asc' ? cmp : -cmp;
    });

    const SortIcon = ({ col }: { col: SortKey }) => {
        if (sortKey !== col) return <span className="text-tron-text-secondary/30 ml-0.5">↕</span>;
        return <span className="text-tron-orange ml-0.5">{sortDir === 'asc' ? '↑' : '↓'}</span>;
    };

    const columns: { key: SortKey; label: string; align: 'left' | 'right' }[] = [
        { key: 'date', label: 'Date', align: 'left' },
        { key: 'open', label: 'Open', align: 'right' },
        { key: 'high', label: 'High', align: 'right' },
        { key: 'low', label: 'Low', align: 'right' },
        { key: 'close', label: 'Close', align: 'right' },
        { key: 'volume', label: 'Volume', align: 'right' },
    ];

    return (
        <div>
            {/* Range selector */}
            <div className="flex gap-1 mb-4 overflow-x-auto">
                {RANGES.map((r) => (
                    <button
                        key={r.id}
                        onClick={() => setRange(r.id)}
                        className={`px-3 py-1.5 text-xs font-mono rounded transition-all ${range === r.id
                                ? 'bg-tron-orange text-black shadow-tron-glow'
                                : 'bg-tron-bg-card text-tron-text-secondary hover:text-tron-text-primary border border-tron'
                            }`}
                    >
                        {r.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            {loading ? (
                <div className="space-y-2 animate-pulse">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="h-8 bg-tron-bg-card rounded" />
                    ))}
                </div>
            ) : error ? (
                <div className="p-6 text-center rounded-lg bg-tron-bg-card border border-tron">
                    <p className="text-sm text-tron-red mb-2">{error}</p>
                    <p className="text-xs text-tron-text-secondary">Unable to load historical data.</p>
                </div>
            ) : sortedData.length === 0 ? (
                <div className="p-6 text-center rounded-lg bg-tron-bg-card border border-tron">
                    <p className="text-sm text-tron-text-secondary">No historical data available for this range.</p>
                </div>
            ) : (
                <>
                    <div className="text-xs text-tron-text-secondary mb-2">
                        {sortedData.length} data points
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-tron">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="bg-tron-bg-card">
                                    {columns.map((col) => (
                                        <th
                                            key={col.key}
                                            onClick={() => handleSort(col.key)}
                                            className={`px-3 py-2 border-b border-tron font-heading text-tron-text-secondary cursor-pointer hover:text-tron-orange transition-colors select-none whitespace-nowrap ${col.align === 'right' ? 'text-right' : 'text-left'
                                                }`}
                                        >
                                            {col.label}
                                            <SortIcon col={col.key} />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sortedData.map((row: any, i: number) => {
                                    const isUp = row.close >= row.open;
                                    return (
                                        <tr
                                            key={i}
                                            className="border-b border-tron/20 hover:bg-tron-bg-card/50 transition-colors"
                                        >
                                            <td className="px-3 py-2 font-mono text-tron-text-primary whitespace-nowrap">
                                                {row.date}
                                            </td>
                                            <td className="text-right px-3 py-2 font-mono text-tron-text-primary">
                                                {formatINR(row.open)}
                                            </td>
                                            <td className="text-right px-3 py-2 font-mono text-tron-green">
                                                {formatINR(row.high)}
                                            </td>
                                            <td className="text-right px-3 py-2 font-mono text-tron-red">
                                                {formatINR(row.low)}
                                            </td>
                                            <td className={`text-right px-3 py-2 font-mono ${isUp ? 'text-tron-green' : 'text-tron-red'}`}>
                                                {formatINR(row.close)}
                                            </td>
                                            <td className="text-right px-3 py-2 font-mono text-tron-text-secondary">
                                                {formatVolume(row.volume)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

export default HistoricalTab;
