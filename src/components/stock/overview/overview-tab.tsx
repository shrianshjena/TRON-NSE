'use client';

import { useEffect, useRef, useState } from 'react';
import { useStockData } from '@/hooks/use-stock-data';
import { formatINR, formatMarketCap, formatVolume, formatPercent, formatNumber } from '@/lib/utils/format';

// ---------- Price Chart (TradingView Lightweight Charts) ----------

function PriceChart({ ticker }: { ticker: string }) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [activeRange, setActiveRange] = useState('1M');
    const { data, loading, error } = useStockData<any>(
        `/api/stock/${ticker}/historical?range=${activeRange}`
    );

    const ranges = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y', 'MAX'];

    useEffect(() => {
        if (!chartContainerRef.current || !data?.data?.length) return;

        let chart: any = null;

        const initChart = async () => {
            try {
                const { createChart, ColorType, LineStyle } = await import('lightweight-charts');

                // Clear previous chart
                if (chartContainerRef.current) {
                    chartContainerRef.current.innerHTML = '';
                }

                chart = createChart(chartContainerRef.current!, {
                    layout: {
                        background: { type: ColorType.Solid, color: 'transparent' },
                        textColor: '#8888a0',
                        fontFamily: "'Share Tech Mono', monospace",
                    },
                    grid: {
                        vertLines: { color: 'rgba(255,106,0,0.05)' },
                        horzLines: { color: 'rgba(255,106,0,0.05)' },
                    },
                    crosshair: {
                        vertLine: { color: 'rgba(255,106,0,0.4)', labelBackgroundColor: '#FF6A00' },
                        horzLine: { color: 'rgba(255,106,0,0.4)', labelBackgroundColor: '#FF6A00' },
                    },
                    width: chartContainerRef.current!.clientWidth,
                    height: 320,
                    timeScale: {
                        borderColor: 'rgba(255,106,0,0.15)',
                        timeVisible: activeRange === '1D',
                    },
                    rightPriceScale: {
                        borderColor: 'rgba(255,106,0,0.15)',
                    },
                });

                const lineSeries = chart.addAreaSeries({
                    lineColor: '#FF6A00',
                    topColor: 'rgba(255,106,0,0.25)',
                    bottomColor: 'rgba(255,106,0,0.01)',
                    lineWidth: 2,
                    crosshairMarkerBackgroundColor: '#FF6A00',
                    crosshairMarkerBorderColor: '#FF6A00',
                });

                const chartData = data.data.map((d: any) => ({
                    time: d.date.includes(' ') ? d.date.replace(' ', 'T') : d.date,
                    value: d.close,
                }));

                lineSeries.setData(chartData);
                chart.timeScale().fitContent();

                // Handle resize
                const handleResize = () => {
                    if (chartContainerRef.current && chart) {
                        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
                    }
                };
                window.addEventListener('resize', handleResize);

                return () => {
                    window.removeEventListener('resize', handleResize);
                };
            } catch (err) {
                console.error('Failed to initialize chart:', err);
            }
        };

        initChart();

        return () => {
            if (chart) {
                chart.remove();
            }
        };
    }, [data, activeRange]);

    return (
        <div>
            {/* Range selector */}
            <div className="flex gap-1 mb-3 overflow-x-auto">
                {ranges.map((r) => (
                    <button
                        key={r}
                        onClick={() => setActiveRange(r)}
                        className={`px-3 py-1.5 text-xs font-mono rounded transition-all ${activeRange === r
                                ? 'bg-tron-orange text-black shadow-tron-glow'
                                : 'bg-tron-bg-card text-tron-text-secondary hover:text-tron-text-primary border border-tron'
                            }`}
                    >
                        {r}
                    </button>
                ))}
            </div>

            {/* Chart */}
            <div className="relative rounded-lg bg-tron-bg-card border border-tron overflow-hidden">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-tron-bg-card/80 z-10">
                        <div className="w-6 h-6 border-2 border-tron-orange border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                {error && (
                    <div className="flex items-center justify-center h-[320px] text-sm text-tron-text-secondary">
                        {error}
                    </div>
                )}
                <div ref={chartContainerRef} className="w-full" style={{ minHeight: 320 }} />
            </div>
        </div>
    );
}

// ---------- Key Stats Grid ----------

function KeyStats({ overview }: { overview: any }) {
    if (!overview) return null;

    const stats = [
        { label: 'Previous Close', value: formatINR(overview.previousClose) },
        { label: 'Open', value: formatINR(overview.open) },
        { label: 'Day High', value: formatINR(overview.dayHigh) },
        { label: 'Day Low', value: formatINR(overview.dayLow) },
        { label: '52W High', value: formatINR(overview.weekHigh52) },
        { label: '52W Low', value: formatINR(overview.weekLow52) },
        { label: 'Market Cap', value: formatMarketCap(overview.marketCap) },
        { label: 'P/E Ratio', value: formatNumber(overview.peRatio) },
        { label: 'P/B Ratio', value: formatNumber(overview.pbRatio) },
        { label: 'EPS', value: formatINR(overview.eps) },
        { label: 'Dividend Yield', value: overview.dividendYield != null ? `${overview.dividendYield.toFixed(2)}%` : '--' },
        { label: 'Volume', value: formatVolume(overview.volume) },
        { label: 'Beta', value: formatNumber(overview.beta) },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {stats.map((s) => (
                <div key={s.label} className="p-2.5 rounded-lg bg-tron-bg-card border border-tron">
                    <div className="text-[10px] uppercase tracking-wider text-tron-text-secondary mb-1">
                        {s.label}
                    </div>
                    <div className="font-mono text-sm text-tron-text-primary">{s.value}</div>
                </div>
            ))}
        </div>
    );
}

// ---------- News Feed ----------

function NewsFeed({ news }: { news: any[] }) {
    if (!news?.length) return null;

    return (
        <div className="mt-6">
            <h3 className="font-heading text-sm text-tron-orange mb-3 tracking-wider">
                LATEST NEWS
            </h3>
            <div className="space-y-2">
                {news.map((item: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg bg-tron-bg-card border border-tron hover:border-tron-orange/30 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                {item.url ? (
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-tron-text-primary hover:text-tron-orange transition-colors line-clamp-2"
                                    >
                                        {item.headline}
                                    </a>
                                ) : (
                                    <p className="text-sm text-tron-text-primary line-clamp-2">{item.headline}</p>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-tron-text-secondary">{item.source}</span>
                                    <span className="text-[10px] text-tron-text-secondary/50">·</span>
                                    <span className="text-[10px] text-tron-text-secondary">{item.date}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ---------- Key Issues (Bull / Bear) ----------

function KeyIssues({ issues }: { issues: any[] }) {
    if (!issues?.length) return null;

    return (
        <div className="mt-6">
            <h3 className="font-heading text-sm text-tron-orange mb-3 tracking-wider">
                KEY ISSUES — BULL VS BEAR
            </h3>
            <div className="space-y-3">
                {issues.map((issue: any, i: number) => (
                    <div key={i} className="rounded-lg bg-tron-bg-card border border-tron overflow-hidden">
                        <div className="px-3 py-2 text-xs font-heading text-tron-text-primary border-b border-tron/50">
                            {issue.topic}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-tron/30">
                            {/* Bull */}
                            <div className="p-3">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <span className="text-tron-green text-xs">▲</span>
                                    <span className="text-[10px] uppercase tracking-wider text-tron-green font-heading">Bullish</span>
                                </div>
                                <p className="text-xs text-tron-text-primary mb-1">{issue.bullishView?.summary}</p>
                                <p className="text-[10px] text-tron-text-secondary leading-relaxed">{issue.bullishView?.rationale}</p>
                            </div>
                            {/* Bear */}
                            <div className="p-3">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <span className="text-tron-red text-xs">▼</span>
                                    <span className="text-[10px] uppercase tracking-wider text-tron-red font-heading">Bearish</span>
                                </div>
                                <p className="text-xs text-tron-text-primary mb-1">{issue.bearishView?.summary}</p>
                                <p className="text-[10px] text-tron-text-secondary leading-relaxed">{issue.bearishView?.rationale}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ---------- Overview Tab ----------

function OverviewTab({ ticker }: { ticker: string }) {
    const { data, loading, error } = useStockData<any>(
        `/api/stock/${ticker}/overview`
    );

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-[320px] bg-tron-bg-card rounded-lg" />
                <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="h-14 bg-tron-bg-card rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center rounded-lg bg-tron-bg-card border border-tron">
                <p className="text-sm text-tron-red mb-2">{error}</p>
                <p className="text-xs text-tron-text-secondary">Unable to load overview data.</p>
            </div>
        );
    }

    return (
        <div>
            <PriceChart ticker={ticker} />
            <div className="mt-6">
                <h3 className="font-heading text-sm text-tron-orange mb-3 tracking-wider">
                    KEY STATISTICS
                </h3>
                <KeyStats overview={data?.overview} />
            </div>
            <NewsFeed news={data?.news} />
            <KeyIssues issues={data?.keyIssues} />
        </div>
    );
}

export default OverviewTab;
