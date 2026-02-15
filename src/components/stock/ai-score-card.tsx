'use client';

import { useEffect, useState } from 'react';
import { useStockData } from '@/hooks/use-stock-data';

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const duration = 1200;
    const steps = 40;
    const increment = score / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(score, Math.round(increment * step));
      setAnimatedScore(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const glowIntensity = score / 100;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,106,0,0.1)"
          strokeWidth="6"
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#FF6A00"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.1s ease',
            filter: `drop-shadow(0 0 ${6 + glowIntensity * 10}px rgba(255,106,0,${0.3 + glowIntensity * 0.4}))`,
          }}
        />
      </svg>
      <div className="absolute text-center">
        <span className="font-mono text-2xl font-bold text-tron-text-primary">
          {animatedScore}
        </span>
        <span className="block text-[10px] text-tron-text-secondary uppercase tracking-wider">
          Score
        </span>
      </div>
    </div>
  );
}

export function AIScoreCard({ ticker }: { ticker: string }) {
  const { data, loading, error } = useStockData<any>(
    `/api/stock/${ticker}/ai-score`
  );
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="p-4 rounded-lg bg-tron-bg-card border border-tron animate-pulse">
        <div className="h-5 w-32 bg-tron-bg-secondary rounded mb-4" />
        <div className="flex justify-center mb-4">
          <div className="w-[120px] h-[120px] rounded-full bg-tron-bg-secondary" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 bg-tron-bg-secondary rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 rounded-lg bg-tron-bg-card border border-tron">
        <h3 className="font-heading text-sm text-tron-orange mb-2">AI Analysis</h3>
        <p className="text-xs text-tron-text-secondary">
          {error || 'AI analysis unavailable'}
        </p>
      </div>
    );
  }

  const classificationColor =
    data.classification === 'Bullish'
      ? 'text-tron-green'
      : data.classification === 'Bearish'
      ? 'text-tron-red'
      : 'text-tron-orange';

  const sections = [
    { key: 'valuation', label: 'Valuation Analysis', content: data.valuationAnalysis },
    { key: 'financial', label: 'Financial Health', content: data.financialHealthAnalysis },
    { key: 'growth', label: 'Growth Outlook', content: data.growthOutlook },
    { key: 'risk', label: 'Risk Factors', content: data.riskFactors?.join('. ') },
    { key: 'shortTerm', label: 'Short-Term Outlook', content: data.shortTermOutlook },
    { key: 'longTerm', label: 'Long-Term Outlook', content: data.longTermOutlook },
    { key: 'sentiment', label: 'Sentiment Summary', content: data.sentimentSummary },
  ].filter((s) => s.content);

  return (
    <div className="p-4 rounded-lg bg-tron-bg-card border border-tron glow-border">
      <h3 className="font-heading text-sm text-tron-orange mb-4">AI Investment Score</h3>

      <div className="flex justify-center mb-3">
        <ScoreRing score={data.score || 0} />
      </div>

      <div className="text-center mb-4">
        <span className={`font-heading text-sm font-bold ${classificationColor}`}>
          {data.classification}
        </span>
        {data.grade && (
          <span className="block text-xs text-tron-text-secondary mt-0.5">
            {data.grade}
          </span>
        )}
        {data.confidence !== undefined && (
          <span className="block text-[10px] text-tron-text-secondary/60 mt-1">
            Confidence: {data.confidence}%
          </span>
        )}
      </div>

      {/* Breakdown bars */}
      {data.breakdown && (
        <div className="space-y-2 mb-4">
          {Object.entries(data.breakdown).map(([key, val]: [string, any]) => (
            <div key={key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-tron-text-secondary capitalize">{key}</span>
                <span className="font-mono text-tron-text-primary">{val.score}</span>
              </div>
              <div className="h-1.5 bg-tron-bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-tron-orange rounded-full transition-all duration-700"
                  style={{
                    width: `${val.score}%`,
                    boxShadow: '0 0 6px rgba(255,106,0,0.4)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Collapsible sections */}
      <div className="space-y-1">
        {sections.map((s) => (
          <div key={s.key} className="border-t border-tron/50">
            <button
              onClick={() => toggleSection(s.key)}
              className="w-full flex justify-between items-center py-2 text-xs text-tron-text-secondary hover:text-tron-orange transition-colors"
            >
              <span>{s.label}</span>
              <span className="text-tron-orange">
                {expandedSections.has(s.key) ? '−' : '+'}
              </span>
            </button>
            {expandedSections.has(s.key) && (
              <p className="text-xs text-tron-text-secondary/80 pb-2 leading-relaxed animate-fade-in">
                {s.content}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-tron-text-secondary/40 mt-3 pt-2 border-t border-tron/30">
        For informational purposes only. Not investment advice.
      </p>
    </div>
  );
}
