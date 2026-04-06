// src/lib/chart-theme.ts
// Single source of truth for all Recharts styling

export const chartTheme = {
  // Grid
  gridColor:      '#1F1F1F',
  gridDashArray:  '3 3',

  // Axes
  axisColor:      '#2A2A2A',
  axisTickColor:  '#606060',
  axisFontSize:   11,
  axisFontFamily: 'ui-monospace, monospace',

  // Tooltip
  tooltip: {
    contentStyle: {
      backgroundColor: '#1A1A1A',
      border:          '1px solid #2A2A2A',
      borderRadius:    '12px',
      color:           '#F0F0F0',
      fontSize:        12,
      padding:         '10px 14px',
      boxShadow:       '0 8px 32px rgba(0,0,0,0.5)',
    },
    labelStyle: {
      color:      '#A0A0A0',
      fontWeight: 600,
      fontSize:   11,
      marginBottom: 4,
    },
    itemStyle: {
      color:    '#F0F0F0',
      fontSize: 12,
    },
    cursor: { fill: 'rgba(255,255,255,0.03)' },
  },

  // Legend
  legend: {
    wrapperStyle: {
      color:    '#606060',
      fontSize: 11,
      paddingTop: 12,
    },
  },

  // Bar colors
  bars: {
    completed:  '#10B981',
    scheduled:  '#1F2A1F',
    skipped:    '#EF4444',
    partial:    '#F59E0B',
  },

  // Line colors
  lines: {
    primary:   '#10B981',
    secondary: '#3B82F6',
  },

  // Pie/Donut
  pie: {
    innerRadius: '60%',
    outerRadius: '85%',
    paddingAngle: 3,
    cornerRadius: 4,
  },

  // Reference line
  referenceLine: {
    stroke:    '#333333',
    strokeDashArray: '3 3',
  },
} as const
