'use client';

import { useMemo } from 'react';
import {
  LineChart as RLineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { chartColors, tooltipStyle } from './chartTheme';

export interface LineSeries {
  dataKey: string;
  name: string;
  color?: string;
}

interface Props {
  data: Array<Record<string, unknown>>;
  xKey: string;
  series: LineSeries[];
  height?: number;
  showLegend?: boolean;
  xTickFormatter?: (v: unknown) => string;
  yTickFormatter?: (v: unknown) => string;
}

function niceStep(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const fraction = value / magnitude;
  const niceFraction = fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10;
  return niceFraction * magnitude;
}

function getAutoDomain(data: Array<Record<string, unknown>>, series: LineSeries[]): [number, number] {
  const values = data.flatMap((point) => series.flatMap((item) => {
    const rawValue = point[item.dataKey];
    if (rawValue === null || rawValue === undefined || rawValue === '') return [];
    const value = Number(rawValue);
    return Number.isFinite(value) ? [value] : [];
  }));

  if (values.length === 0) return [0, 1];

  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const span = dataMax - dataMin;
  const padding = span === 0
    ? Math.max(Math.abs(dataMax) * 0.1, 1)
    : span * 0.12;
  const paddedMin = dataMin - padding;
  const paddedMax = dataMax + padding;
  const step = niceStep((paddedMax - paddedMin) / 5);

  const domainMin = Math.floor(paddedMin / step) * step;
  const domainMax = Math.ceil(paddedMax / step) * step;
  return domainMin === domainMax
    ? [domainMin - step, domainMax + step]
    : [domainMin, domainMax];
}

export function LineChart({
  data,
  xKey,
  series,
  height = 280,
  showLegend = false,
  xTickFormatter,
  yTickFormatter,
}: Props) {
  const yDomain = useMemo(() => getAutoDomain(data, series), [data, series]);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RLineChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={chartColors.grid} strokeDasharray="0" vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fill: chartColors.text, fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: chartColors.grid }}
          tickFormatter={xTickFormatter}
        />
        <YAxis
          domain={yDomain}
          tickCount={6}
          allowDataOverflow
          tick={{ fill: chartColors.text, fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: chartColors.grid }}
          tickFormatter={yTickFormatter}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ stroke: chartColors.axis, strokeDasharray: '3 3' }}
          labelStyle={{ color: '#F0F2F5' }}
        />
        {showLegend && (
          <Legend
            wrapperStyle={{ fontSize: 11, color: chartColors.text, paddingTop: 8 }}
            iconType="square"
          />
        )}
        {series.map((s, i) => (
          <Line
            key={s.dataKey}
            type="monotone"
            dataKey={s.dataKey}
            name={s.name}
            stroke={s.color ?? (i === 0 ? chartColors.primary : chartColors.secondary)}
            strokeWidth={2}
            dot={data.length === 1
              ? { r: 4, strokeWidth: 0, fill: s.color ?? chartColors.primary }
              : false}
            activeDot={{ r: 4, strokeWidth: 0, fill: s.color ?? chartColors.primary }}
            isAnimationActive={false}
          />
        ))}
      </RLineChart>
    </ResponsiveContainer>
  );
}
