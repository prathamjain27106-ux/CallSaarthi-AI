import React, { useState } from 'react';
import { PieChart, Activity, Clock, ShieldAlert } from 'lucide-react';
import { urgencyStats, hourlyCaseTrends } from '../data/mockCases';

export default function Charts() {
  const [activeSegment, setActiveSegment] = useState(null);

  // Calculate SVG Donut parameters
  const totalCases = urgencyStats.reduce((sum, item) => sum + item.count, 0);
  const radius = 64;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;
  const segments = urgencyStats.map((item) => {
    const fraction = item.count / totalCases;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativeOffset;
    cumulativeOffset += fraction * circumference;
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  // Calculate SVG Area chart path for hourly trends
  const maxCases = Math.max(...hourlyCaseTrends.map((d) => d.cases)) + 4; // headroom
  const width = 480;
  const height = 180;
  const paddingX = 40;
  const paddingBottom = 30;
  const paddingTop = 20;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = hourlyCaseTrends.map((d, index) => {
    const x = paddingX + (index / (hourlyCaseTrends.length - 1)) * chartWidth;
    const y = height - paddingBottom - (d.cases / maxCases) * chartHeight;
    return { x, y, ...d };
  });

  // Build SVG path
  const linePath = points.reduce((acc, pt, idx, arr) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[idx - 1];
    const cx = (prev.x + pt.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
  }, '');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  return (
    <div className="charts-grid">
      {/* Chart 1: Urgency Distribution */}
      <div className="chart-card">
        <div className="chart-card-header">
          <div className="chart-header-left">
            <PieChart size={18} className="chart-header-icon" />
            <h3 className="chart-title">Urgency Distribution</h3>
          </div>
          <span className="chart-badge">Live Triage Ratio</span>
        </div>

        <div className="donut-chart-container">
          <div className="donut-svg-wrapper">
            <svg viewBox="0 0 160 160" className="donut-svg">
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth={strokeWidth}
              />
              {segments.map((seg) => (
                <circle
                  key={seg.level}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={activeSegment === seg.level ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  className="donut-segment"
                  onMouseEnter={() => setActiveSegment(seg.level)}
                  onMouseLeave={() => setActiveSegment(null)}
                  style={{
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%',
                    transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                    opacity: activeSegment && activeSegment !== seg.level ? 0.45 : 1,
                    filter: `drop-shadow(0 0 6px ${seg.color}44)`,
                    cursor: 'pointer',
                  }}
                />
              ))}
            </svg>
            <div className="donut-center-text">
              <span className="donut-center-count">{totalCases}</span>
              <span className="donut-center-label">Total Today</span>
            </div>
          </div>

          {/* Legend and stats */}
          <div className="donut-legend">
            {urgencyStats.map((item) => (
              <div 
                key={item.level} 
                className={`legend-item ${activeSegment === item.level ? 'highlighted' : ''}`}
                onMouseEnter={() => setActiveSegment(item.level)}
                onMouseLeave={() => setActiveSegment(null)}
              >
                <div className="legend-item-head">
                  <span className="legend-indicator" style={{ backgroundColor: item.color }} />
                  <span className="legend-label">{item.level}</span>
                  <span className="legend-count">{item.count}</span>
                </div>
                <div className="legend-bar-track">
                  <div 
                    className="legend-bar-fill" 
                    style={{ 
                      width: `${item.percentage}%`, 
                      backgroundColor: item.color 
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart 2: Cases Over Time */}
      <div className="chart-card">
        <div className="chart-card-header">
          <div className="chart-header-left">
            <Activity size={18} className="chart-header-icon" />
            <h3 className="chart-title">Hourly Case Volume</h3>
          </div>
          <span className="chart-badge">08:00 - 20:00 Today</span>
        </div>

        <div className="area-chart-container">
          <svg viewBox={`0 0 ${width} ${height}`} className="area-svg" preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = height - paddingBottom - ratio * chartHeight;
              return (
                <line
                  key={ratio}
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.07)"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Area Fill */}
            <path d={areaPath} fill="url(#areaGradient)" />

            {/* Curve Line */}
            <path
              d={linePath}
              fill="none"
              stroke="#00e5ff"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ filter: 'drop-shadow(0 0 8px rgba(0, 229, 255, 0.5))' }}
            />

            {/* Data Points */}
            {points.map((pt) => (
              <g key={pt.hour} className="chart-point-group">
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4"
                  fill="#0b1329"
                  stroke="#00e5ff"
                  strokeWidth="2"
                  className="chart-dot"
                />
                <text
                  x={pt.x}
                  y={height - 10}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10.5"
                  fontFamily="inherit"
                >
                  {pt.hour}
                </text>
                <text
                  x={pt.x}
                  y={pt.y - 9}
                  textAnchor="middle"
                  fill="#e2e8f0"
                  fontSize="11"
                  fontWeight="600"
                >
                  {pt.cases}
                </text>
              </g>
            ))}
          </svg>

          <div className="chart-footer-meta">
            <div className="meta-pill">
              <span className="dot-peak" /> Peak hour: <strong>16:00 (31 calls)</strong>
            </div>
            <div className="meta-pill">
              <Clock size={12} /> Avg response: <strong>18 seconds</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
