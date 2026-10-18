import React from 'react';
import { 
  PhoneCall, 
  AlertOctagon, 
  Clock3, 
  CheckCircle2, 
  TrendingUp, 
  AlertCircle 
} from 'lucide-react';

export default function MetricCards({ metrics }) {
  const cards = [
    {
      id: 'total',
      title: 'Total Cases Today',
      value: metrics.totalCases.value,
      subtext: `${metrics.totalCases.change} ${metrics.totalCases.period}`,
      icon: PhoneCall,
      accentColor: '#00e5ff',
      trendIcon: TrendingUp,
      trendType: 'positive',
      footerInfo: 'Across 14 regional languages',
    },
    {
      id: 'priority',
      title: 'High-Priority Cases',
      value: metrics.highPriorityCases.value,
      subtext: `${metrics.highPriorityCases.criticalCount} Critical • ${metrics.highPriorityCases.highCount} High Priority`,
      icon: AlertOctagon,
      accentColor: '#ef4444',
      trendIcon: AlertCircle,
      trendType: 'warning',
      footerInfo: 'Immediate dispatch queue',
    },
    {
      id: 'awaiting',
      title: 'Awaiting Review',
      value: metrics.awaitingReview.value,
      subtext: 'Requires human validation',
      icon: Clock3,
      accentColor: '#f59e0b',
      trendIcon: Clock3,
      trendType: 'attention',
      footerInfo: 'Avg triage wait: 1m 42s',
    },
    {
      id: 'reviewed',
      title: 'Cases Reviewed',
      value: metrics.casesReviewed.value,
      subtext: `${metrics.casesReviewed.change} Completed Triage`,
      icon: CheckCircle2,
      accentColor: '#10b981',
      trendIcon: TrendingUp,
      trendType: 'positive',
      footerInfo: '14 escalated to field PCR',
    },
  ];

  return (
    <div className="metrics-grid">
      {cards.map((card) => {
        const Icon = card.icon;
        const TrendIcon = card.trendIcon;

        return (
          <div key={card.id} className="metric-card">
            <div className="metric-card-top">
              <span className="metric-card-title">{card.title}</span>
              <div 
                className="metric-icon-wrapper" 
                style={{ 
                  color: card.accentColor, 
                  backgroundColor: `${card.accentColor}18`,
                  borderColor: `${card.accentColor}33` 
                }}
              >
                <Icon size={20} />
              </div>
            </div>

            <div className="metric-card-main">
              <span className="metric-value">{card.value}</span>
            </div>

            <div className="metric-card-footer">
              <div className={`metric-badge badge-${card.trendType}`}>
                <TrendIcon size={13} />
                <span>{card.subtext}</span>
              </div>
              <span className="metric-footnote">{card.footerInfo}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
