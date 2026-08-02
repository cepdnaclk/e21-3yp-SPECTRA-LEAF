import React, { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Line, Polygon, Polyline, Stop } from 'react-native-svg';
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

const PAD_X = 10;
const PAD_Y = 12;

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
    () => points.slice(compact ? -12 : -30).filter(point => Number.isFinite(Number(point.value))),
    [compact, points],
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
        <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No samples to chart</Text>
      </View>
    );
  }

  const numeric = values.map(point => Number(point.value));
  const min = Math.min(...numeric);
  const max = Math.max(...numeric);
  const range = max - min || Math.max(Math.abs(max) * 0.05, 1);
  const chartColor = color ?? theme.colors.primary;
  const chartWidth = Math.max(width, 1);
  const plotWidth = chartWidth - PAD_X * 2;
  const plotHeight = height - PAD_Y * 2;
  const coords = numeric.map((value, index) => {
    const x = PAD_X + (index / Math.max(numeric.length - 1, 1)) * plotWidth;
    const y = PAD_Y + (1 - (value - min) / range) * plotHeight;
    return { x, y };
  });
  const linePoints = coords.map(point => `${point.x},${point.y}`).join(' ');
  const areaPoints = `${PAD_X},${height - PAD_Y} ${linePoints} ${chartWidth - PAD_X},${height - PAD_Y}`;
  const latest = numeric[numeric.length - 1];
  const gradientId = `chart-fill-${theme.mode}`;

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
          {[0.25, 0.5, 0.75].map(level => (
            <Line
              key={level}
              x1={PAD_X}
              y1={PAD_Y + plotHeight * level}
              x2={chartWidth - PAD_X}
              y2={PAD_Y + plotHeight * level}
              stroke={theme.colors.chartGrid}
              strokeWidth="1"
              strokeDasharray="4 6"
            />
          ))}
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
            MIN {fmtNumber(min, 1)}{unit}
          </Text>
          <Text style={[styles.latest, { color: chartColor }]}>
            NOW {fmtNumber(latest, 1)}{unit}
          </Text>
          <Text style={[styles.range, { color: theme.colors.textMuted }]}>
            MAX {fmtNumber(max, 1)}{unit}
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
