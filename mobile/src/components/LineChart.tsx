import React, { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Line,
  Polygon,
  Polyline,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { GraphPoint } from '../types';
import { fmtNumber } from '../lib/format';
import { useAppTheme } from '../theme';

interface Props {
  points: GraphPoint[];
  height?: number;
  color?: string;
  unit?: string;
  compact?: boolean;
}

const PAD_LEFT = 42;
const PAD_RIGHT = 10;
const PAD_Y = 12;

function niceStep(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const fraction = value / magnitude;
  const niceFraction = fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10;
  return niceFraction * magnitude;
}

function getAutoDomain(values: number[]): [number, number] {
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

export default function LineChart({
  points,
  height = 170,
  color,
  unit = '',
  compact = false,
}: Props) {
  const theme = useAppTheme();
  const [width, setWidth] = useState(0);
  const values = useMemo(
    () => points.filter(point => Number.isFinite(Number(point.value))),
    [points],
  );

  const onLayout = (event: LayoutChangeEvent) => {
    setWidth(Math.round(event.nativeEvent.layout.width));
  };

  if (!values.length) {
    return (
      <View
        onLayout={onLayout}
        style={[styles.empty, { height, borderColor: theme.colors.border }]}
      >
        <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No batch readings to chart</Text>
      </View>
    );
  }

  const numeric = values.map(point => Number(point.value));
  const dataMin = Math.min(...numeric);
  const dataMax = Math.max(...numeric);
  const [domainMin, domainMax] = getAutoDomain(numeric);
  const range = domainMax - domainMin;
  const chartColor = color ?? theme.colors.primary;
  const chartWidth = Math.max(width, 1);
  const plotWidth = Math.max(chartWidth - PAD_LEFT - PAD_RIGHT, 1);
  const plotHeight = height - PAD_Y * 2;
  const coords = numeric.map((value, index) => {
    const x = numeric.length === 1
      ? PAD_LEFT + plotWidth / 2
      : PAD_LEFT + (index / (numeric.length - 1)) * plotWidth;
    const y = PAD_Y + (1 - (value - domainMin) / range) * plotHeight;
    return { x, y };
  });
  const linePoints = coords.map(point => `${point.x},${point.y}`).join(' ');
  const areaPoints = `${PAD_LEFT},${height - PAD_Y} ${linePoints} ${chartWidth - PAD_RIGHT},${height - PAD_Y}`;
  const latest = numeric[numeric.length - 1];
  const gradientId = `chart-fill-${theme.mode}`;
  const tickLevels = [0, 0.2, 0.4, 0.6, 0.8, 1];
  const tickStep = range / (tickLevels.length - 1);
  const tickDigits = tickStep < 1 ? 2 : tickStep < 10 ? 1 : 0;

  return (
    <View onLayout={onLayout}>
      {width > 0 ? (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={chartColor} stopOpacity="0.28" />
              <Stop offset="1" stopColor={chartColor} stopOpacity="0.01" />
            </LinearGradient>
          </Defs>
          {tickLevels.map(level => {
            const y = PAD_Y + plotHeight * level;
            const tickValue = domainMax - range * level;
            return (
              <React.Fragment key={level}>
                <Line
                  x1={PAD_LEFT}
                  y1={y}
                  x2={chartWidth - PAD_RIGHT}
                  y2={y}
                  stroke={theme.colors.chartGrid}
                  strokeWidth="1"
                  strokeDasharray="4 6"
                />
                <SvgText
                  x={PAD_LEFT - 6}
                  y={y + 3}
                  fill={theme.colors.textMuted}
                  fontSize="8"
                  fontWeight="700"
                  textAnchor="end"
                >
                  {fmtNumber(tickValue, tickDigits)}
                </SvgText>
              </React.Fragment>
            );
          })}
          <Polygon points={areaPoints} fill={`url(#${gradientId})`} />
          <Polyline
            points={linePoints}
            fill="none"
            stroke={chartColor}
            strokeWidth={compact ? 2.5 : 3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {coords.length ? (
            <Circle
              cx={coords[coords.length - 1].x}
              cy={coords[coords.length - 1].y}
              r={4.5}
              fill={theme.colors.surface}
              stroke={chartColor}
              strokeWidth="3"
            />
          ) : null}
        </Svg>
      ) : (
        <View style={{ height }} />
      )}
      {!compact ? (
        <View style={styles.legend}>
          <Text style={[styles.range, { color: theme.colors.textMuted }]}>
            MIN {fmtNumber(dataMin, 1)}{unit}
          </Text>
          <Text style={[styles.latest, { color: chartColor }]}>
            NOW {fmtNumber(latest, 1)}{unit}
          </Text>
          <Text style={[styles.range, { color: theme.colors.textMuted }]}>
            MAX {fmtNumber(dataMax, 1)}{unit}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { fontSize: 10, fontWeight: '800' },
  legend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 7 },
  range: { fontSize: 8, fontWeight: '900' },
  latest: { fontSize: 8, fontWeight: '900' },
});
