import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Svg, { Circle, G, Rect, Text as SvgText } from 'react-native-svg';
import {
  BarChart,
  LineChart,
  LineChartBicolor,
  PieChart,
  RadarChart,
} from 'react-native-gifted-charts';

// ============================================================================
// SHARED UI HELPERS
// ============================================================================

type ChartSectionProps = {
  emoji: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

function ChartSection({ emoji, title, description, children }: ChartSectionProps) {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
      <View className="flex-row items-center gap-3 mb-3">
        <View className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 items-center justify-center">
          <Text className="text-lg">{emoji}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold text-gray-900 dark:text-white">
            {title}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {description}
          </Text>
        </View>
      </View>
      <View className="items-center">{children}</View>
    </View>
  );
}

type StepperProps = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
  color?: string;
};

function Stepper({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 5,
  label,
  color,
}: StepperProps) {
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(Math.min(max, value + step));
  return (
    <View className="flex-row items-center gap-2 w-full">
      {color ? (
        <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
      ) : null}
      <Text
        className="text-xs font-medium text-gray-700 dark:text-gray-300 w-12"
        numberOfLines={1}>
        {label}
      </Text>
      <Pressable
        onPress={dec}
        className="w-7 h-7 rounded-md bg-gray-100 dark:bg-gray-700 items-center justify-center active:opacity-60">
        <Text className="text-base text-gray-700 dark:text-gray-200">−</Text>
      </Pressable>
      <Text className="text-xs font-bold text-gray-900 dark:text-white w-10 text-center">
        {value}
      </Text>
      <Pressable
        onPress={inc}
        className="w-7 h-7 rounded-md bg-gray-100 dark:bg-gray-700 items-center justify-center active:opacity-60">
        <Text className="text-base text-gray-700 dark:text-gray-200">+</Text>
      </Pressable>
    </View>
  );
}

// ============================================================================
// 1. BAR CHART EDITABLE — tap to highlight + stepper untuk edit value
// ============================================================================

const INITIAL_BARS = [
  { label: 'Sen', value: 40 },
  { label: 'Sel', value: 65 },
  { label: 'Rab', value: 50 },
  { label: 'Kam', value: 80 },
  { label: 'Jum', value: 70 },
];

function EditableBarChartSection() {
  const [bars, setBars] = useState(INITIAL_BARS);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const data = bars.map((b, i) => ({
    label: b.label,
    value: b.value,
    frontColor: i === selectedIdx ? '#0a7ea4' : '#94a3b8',
    topLabelComponent:
      i === selectedIdx
        ? () => <Text className="text-[10px] font-bold text-primary mb-1">{b.value}</Text>
        : undefined,
    onPress: () => setSelectedIdx(selectedIdx === i ? null : i),
  }));

  const updateBar = (idx: number, newValue: number) =>
    setBars((prev) => prev.map((b, i) => (i === idx ? { ...b, value: newValue } : b)));

  return (
    <ChartSection
      emoji="📊"
      title="Bar Chart Editable"
      description="Tap bar untuk highlight. Edit nilai pakai stepper di bawah.">
      <BarChart
        data={data}
        width={260}
        height={180}
        barWidth={28}
        barBorderRadius={6}
        yAxisColor="#e5e7eb"
        xAxisColor="#e5e7eb"
        yAxisTextStyle={{ color: '#9ca3af', fontSize: 10 }}
        xAxisLabelTextStyle={{ color: '#9ca3af', fontSize: 10 }}
        noOfSections={4}
        maxValue={100}
        initialSpacing={10}
        spacing={20}
        isAnimated
        animationDuration={400}
      />
      <View className="w-full gap-2 mt-3">
        {bars.map((b, i) => (
          <Stepper
            key={b.label}
            label={b.label}
            value={b.value}
            min={0}
            max={100}
            step={5}
            onChange={(v) => updateBar(i, v)}
            color={i === selectedIdx ? '#0a7ea4' : '#94a3b8'}
          />
        ))}
      </View>
      {selectedIdx !== null ? (
        <Pressable onPress={() => setSelectedIdx(null)} className="mt-2 self-start">
          <Text className="text-xs text-primary font-medium">Hapus seleksi</Text>
        </Pressable>
      ) : null}
    </ChartSection>
  );
}

// ============================================================================
// 2. PIE CHART EDITABLE — sliders per slice
// ============================================================================

const INITIAL_SLICES = [
  { label: 'Makanan', value: 35, color: '#0a7ea4' },
  { label: 'Transport', value: 25, color: '#f59e0b' },
  { label: 'Hiburan', value: 20, color: '#22c55e' },
  { label: 'Lainnya', value: 20, color: '#ec4899' },
];

function EditablePieChartSection() {
  const [slices, setSlices] = useState(INITIAL_SLICES);

  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const data = slices.map((s) => ({
    value: s.value,
    color: s.color,
    text: total > 0 ? `${Math.round((s.value / total) * 100)}%` : '',
  }));

  const updateSlice = (idx: number, newValue: number) =>
    setSlices((prev) => prev.map((s, i) => (i === idx ? { ...s, value: newValue } : s)));

  return (
    <ChartSection
      emoji="🥧"
      title="Pie Chart Editable"
      description="Atur tiap slice via stepper. Persentase auto-recalculate.">
      <PieChart
        data={data}
        radius={90}
        innerRadius={55}
        donut
        showText
        textColor="white"
        textSize={11}
        fontWeight="bold"
        centerLabelComponent={() => (
          <View className="items-center">
            <Text className="text-[10px] text-gray-500 uppercase">Total</Text>
            <Text className="text-base font-bold text-gray-900 dark:text-white">
              {total}
            </Text>
          </View>
        )}
      />
      <View className="w-full gap-2 mt-3">
        {slices.map((s, i) => (
          <Stepper
            key={s.label}
            label={s.label}
            value={s.value}
            min={0}
            max={100}
            step={5}
            onChange={(v) => updateSlice(i, v)}
            color={s.color}
          />
        ))}
      </View>
    </ChartSection>
  );
}

// ============================================================================
// 3. LINE CHART WITH POINTER — touch untuk show tooltip
// ============================================================================

const POINTER_DATA = [
  { value: 50, label: 'Sen' },
  { value: 80, label: 'Sel' },
  { value: 45, label: 'Rab' },
  { value: 110, label: 'Kam' },
  { value: 75, label: 'Jum' },
  { value: 95, label: 'Sab' },
  { value: 88, label: 'Min' },
];

function LineWithPointerSection() {
  return (
    <ChartSection
      emoji="🎯"
      title="Line Chart + Pointer Tooltip"
      description="Sentuh chart untuk lihat nilai tepat di titik tertentu (long-press di Android).">
      <LineChart
        data={POINTER_DATA}
        width={260}
        height={180}
        color="#0a7ea4"
        thickness={3}
        curved
        dataPointsColor="#0a7ea4"
        dataPointsRadius={5}
        yAxisColor="#e5e7eb"
        xAxisColor="#e5e7eb"
        yAxisTextStyle={{ color: '#9ca3af', fontSize: 10 }}
        xAxisLabelTextStyle={{ color: '#9ca3af', fontSize: 10 }}
        noOfSections={4}
        initialSpacing={10}
        spacing={36}
        pointerConfig={{
          pointerStripHeight: 160,
          pointerStripColor: '#0a7ea4',
          pointerStripWidth: 2,
          pointerColor: '#0a7ea4',
          radius: 6,
          pointerLabelWidth: 100,
          pointerLabelHeight: 90,
          activatePointersOnLongPress: false,
          autoAdjustPointerLabelPosition: true,
          pointerLabelComponent: (items: { value: number; label: string }[]) => (
            <View className="bg-gray-900 rounded-lg px-3 py-2 items-center">
              <Text className="text-[10px] text-gray-300">{items[0]?.label ?? ''}</Text>
              <Text className="text-sm font-bold text-white">{items[0]?.value}</Text>
            </View>
          ),
        }}
      />
    </ChartSection>
  );
}

// ============================================================================
// 4. RADAR CHART WITH PRESETS
// ============================================================================

const RADAR_LABELS = ['React', 'TS', 'CSS', 'Node', 'DB', 'DevOps'];
const RADAR_PRESETS: Record<string, number[]> = {
  Frontend: [9, 9, 8, 4, 3, 4],
  Backend: [3, 6, 3, 9, 9, 8],
  Fullstack: [7, 8, 7, 7, 7, 6],
  Junior: [4, 3, 5, 3, 2, 1],
};

function RadarChartSection() {
  const [preset, setPreset] = useState<keyof typeof RADAR_PRESETS>('Frontend');

  return (
    <ChartSection
      emoji="🕸️"
      title="Radar Chart — Skill Profile"
      description="Bandingkan 6 dimensi skill. Tap preset untuk switch profil.">
      <View className="flex-row flex-wrap gap-2 mb-3">
        {Object.keys(RADAR_PRESETS).map((key) => {
          const isActive = key === preset;
          return (
            <Pressable
              key={key}
              onPress={() => setPreset(key as keyof typeof RADAR_PRESETS)}
              className={`px-3 py-1.5 rounded-lg border ${
                isActive
                  ? 'bg-primary border-primary'
                  : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
              }`}>
              <Text
                className={`text-xs font-medium ${
                  isActive ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                }`}>
                {key}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <RadarChart
        data={RADAR_PRESETS[preset]}
        labels={RADAR_LABELS}
        maxValue={10}
        chartSize={240}
        noOfSections={5}
        polygonConfig={{
          fill: '#0a7ea4',
          opacity: 0.35,
          stroke: '#0a7ea4',
          strokeWidth: 2,
          showGradient: false,
        }}
        gridConfig={{
          stroke: '#e5e7eb',
          strokeWidth: 1,
        }}
        labelConfig={{
          stroke: '#6b7280',
          fontSize: 11,
          fontWeight: '600',
        }}
        asterLinesConfig={{
          stroke: '#e5e7eb',
          strokeWidth: 1,
        }}
      />
    </ChartSection>
  );
}

// ============================================================================
// 5. BICOLOR LINE CHART — threshold-based coloring
// ============================================================================

const BICOLOR_DATA = [
  { value: 30 },
  { value: 55 },
  { value: 75 },
  { value: 90 },
  { value: 65 },
  { value: 40 },
  { value: 25 },
  { value: 35 },
  { value: 70 },
  { value: 85 },
];

function BicolorLineSection() {
  const [threshold, setThreshold] = useState(60);

  return (
    <ChartSection
      emoji="🔀"
      title="Bicolor Line Chart"
      description="Line ganti warna otomatis di atas / di bawah threshold (target).">
      <LineChartBicolor
        data={BICOLOR_DATA}
        width={260}
        height={180}
        color="#22c55e"
        colorNegative="#ef4444"
        thickness={3}
        startFillColor="#22c55e"
        startFillColorNegative="#ef4444"
        startOpacity={0.3}
        endOpacity={0.05}
        areaChart
        yAxisColor="#e5e7eb"
        xAxisColor="#e5e7eb"
        yAxisTextStyle={{ color: '#9ca3af', fontSize: 10 }}
        noOfSections={4}
        maxValue={100}
        initialSpacing={10}
        spacing={26}
        showReferenceLine1
        referenceLine1Position={threshold}
        referenceLine1Config={{
          color: '#94a3b8',
          dashWidth: 4,
          dashGap: 4,
          labelText: `Target ${threshold}`,
          labelTextStyle: { color: '#64748b', fontSize: 9 },
        }}
      />
      <View className="w-full mt-3">
        <Stepper
          label="Target"
          value={threshold}
          min={0}
          max={100}
          step={5}
          onChange={setThreshold}
          color="#94a3b8"
        />
      </View>
    </ChartSection>
  );
}

// ============================================================================
// 6. LIVE SPARKLINE — auto-update real-time
// ============================================================================

const SPARKLINE_LENGTH = 20;
const INITIAL_SPARK = Array.from({ length: SPARKLINE_LENGTH }, () => ({
  value: 40 + Math.floor(Math.random() * 40),
}));

function LiveSparklineSection() {
  const [points, setPoints] = useState(INITIAL_SPARK);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(800);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!playing) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setPoints((prev) => {
        const last = prev[prev.length - 1]?.value ?? 50;
        const drift = (Math.random() - 0.5) * 30;
        const next = Math.max(10, Math.min(100, Math.round(last + drift)));
        return [...prev.slice(1), { value: next }];
      });
    }, speed);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, speed]);

  const current = points[points.length - 1]?.value ?? 0;
  const trend = current - (points[points.length - 2]?.value ?? current);

  return (
    <ChartSection
      emoji="📡"
      title="Live Sparkline (Real-time)"
      description="Data auto-update tiap interval. Pattern untuk dashboard live (CPU, harga, dll).">
      <View className="flex-row items-center justify-between w-full mb-2">
        <View>
          <Text className="text-[10px] text-gray-500 uppercase">Current</Text>
          <View className="flex-row items-baseline gap-1">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              {current}
            </Text>
            <Text
              className={`text-xs font-semibold ${
                trend > 0
                  ? 'text-green-600'
                  : trend < 0
                    ? 'text-red-600'
                    : 'text-gray-400'
              }`}>
              {trend > 0 ? '▲' : trend < 0 ? '▼' : '–'} {Math.abs(trend)}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => setPlaying((p) => !p)}
          className={`px-4 py-2 rounded-lg ${playing ? 'bg-red-500' : 'bg-green-500'}`}>
          <Text className="text-white text-xs font-bold">
            {playing ? '⏸ Pause' : '▶ Play'}
          </Text>
        </Pressable>
      </View>
      <LineChart
        data={points}
        width={260}
        height={120}
        color="#0a7ea4"
        thickness={2}
        curved
        hideDataPoints
        hideAxesAndRules
        hideYAxisText
        areaChart
        startFillColor="#0a7ea4"
        endFillColor="#0a7ea4"
        startOpacity={0.3}
        endOpacity={0.02}
        initialSpacing={0}
        endSpacing={0}
        spacing={13}
        adjustToWidth
        maxValue={110}
        isAnimated={false}
      />
      <View className="w-full mt-3">
        <Stepper
          label="Speed"
          value={speed}
          min={200}
          max={2000}
          step={200}
          onChange={setSpeed}
        />
        <Text className="text-[10px] text-gray-400 mt-1">
          Interval update dalam ms (200 = cepat, 2000 = lambat)
        </Text>
      </View>
    </ChartSection>
  );
}

// ============================================================================
// 7. CUSTOM HEATMAP — GitHub-style calendar (built with SVG)
// ============================================================================

const HEATMAP_COLS = 12;
const HEATMAP_ROWS = 7;
const HEATMAP_CELL = 18;
const HEATMAP_GAP = 3;

function generateHeatmapData() {
  return Array.from({ length: HEATMAP_COLS * HEATMAP_ROWS }, () =>
    Math.floor(Math.random() * 5)
  );
}

const HEATMAP_COLORS = ['#e5e7eb', '#bae6fd', '#7dd3fc', '#38bdf8', '#0284c7'];

function HeatmapSection() {
  const [data, setData] = useState(() => generateHeatmapData());

  const width = HEATMAP_COLS * (HEATMAP_CELL + HEATMAP_GAP);
  const height = HEATMAP_ROWS * (HEATMAP_CELL + HEATMAP_GAP);
  const total = data.reduce((sum, v) => sum + v, 0);
  const active = data.filter((v) => v > 0).length;

  return (
    <ChartSection
      emoji="🟦"
      title="Heatmap Kalender (Custom SVG)"
      description="GitHub-style contribution grid. Dibangun manual pakai react-native-svg.">
      <View className="flex-row items-center justify-between w-full mb-3">
        <View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            {total}
          </Text>
          <Text className="text-[10px] text-gray-500">
            contributions · {active} hari aktif
          </Text>
        </View>
        <Pressable
          onPress={() => setData(generateHeatmapData())}
          className="px-4 py-2 rounded-lg bg-primary">
          <Text className="text-white text-xs font-bold">🎲 Acak Data</Text>
        </Pressable>
      </View>
      <Svg width={width} height={height}>
        {data.map((value, i) => {
          const col = Math.floor(i / HEATMAP_ROWS);
          const row = i % HEATMAP_ROWS;
          return (
            <Rect
              key={i}
              x={col * (HEATMAP_CELL + HEATMAP_GAP)}
              y={row * (HEATMAP_CELL + HEATMAP_GAP)}
              width={HEATMAP_CELL}
              height={HEATMAP_CELL}
              rx={3}
              fill={HEATMAP_COLORS[value]}
            />
          );
        })}
      </Svg>
      <View className="flex-row items-center gap-1.5 mt-3">
        <Text className="text-[10px] text-gray-500">Less</Text>
        {HEATMAP_COLORS.map((c) => (
          <View key={c} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
        ))}
        <Text className="text-[10px] text-gray-500">More</Text>
      </View>
    </ChartSection>
  );
}

// ============================================================================
// 8. CUSTOM PROGRESS RINGS — multi-ring SVG with editable values
// ============================================================================

type Ring = {
  label: string;
  value: number;
  color: string;
};

const INITIAL_RINGS: Ring[] = [
  { label: 'Move', value: 75, color: '#ef4444' },
  { label: 'Exercise', value: 50, color: '#22c55e' },
  { label: 'Stand', value: 90, color: '#3b82f6' },
];

function ProgressRingsSection() {
  const [rings, setRings] = useState(INITIAL_RINGS);

  const updateRing = (idx: number, value: number) =>
    setRings((prev) => prev.map((r, i) => (i === idx ? { ...r, value } : r)));

  const SIZE = 200;
  const STROKE = 14;
  const GAP = 4;
  const cx = SIZE / 2;
  const cy = SIZE / 2;

  return (
    <ChartSection
      emoji="🎯"
      title="Progress Rings (Custom SVG)"
      description="Multi-ring concentric (mirip Apple Watch). Atur tiap ring via stepper.">
      <Svg width={SIZE} height={SIZE}>
        <G>
          {rings.map((ring, i) => {
            const radius = SIZE / 2 - STROKE / 2 - i * (STROKE + GAP);
            if (radius < STROKE) return null;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference * (1 - ring.value / 100);
            return (
              <G key={ring.label}>
                <Circle
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="none"
                  stroke={ring.color}
                  strokeOpacity={0.15}
                  strokeWidth={STROKE}
                />
                <Circle
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="none"
                  stroke={ring.color}
                  strokeWidth={STROKE}
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  rotation={-90}
                  origin={`${cx},${cy}`}
                />
              </G>
            );
          })}
          <SvgText
            x={cx}
            y={cy + 4}
            fontSize={14}
            fontWeight="bold"
            fill="#1f2937"
            textAnchor="middle">
            {Math.round(rings.reduce((s, r) => s + r.value, 0) / rings.length)}%
          </SvgText>
        </G>
      </Svg>
      <View className="w-full gap-2 mt-3">
        {rings.map((ring, i) => (
          <Stepper
            key={ring.label}
            label={ring.label}
            value={ring.value}
            min={0}
            max={100}
            step={5}
            onChange={(v) => updateRing(i, v)}
            color={ring.color}
          />
        ))}
      </View>
    </ChartSection>
  );
}

// ============================================================================
// MAIN SCREEN
// ============================================================================

export default function ChartsAdvancedScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950">
      <View className="p-4 gap-4">
        <View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Chart Lanjutan
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 mt-1">
            Chart interaktif, custom data, real-time, dan custom SVG.
          </Text>
        </View>

        <EditableBarChartSection />
        <EditablePieChartSection />
        <LineWithPointerSection />
        <RadarChartSection />
        <BicolorLineSection />
        <LiveSparklineSection />
        <HeatmapSection />
        <ProgressRingsSection />

        <View className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/40">
          <Text className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-1">
            💡 Catatan
          </Text>
          <Text className="text-xs text-blue-800 dark:text-blue-300 leading-5">
            Chart no. 7 & 8 (Heatmap, Progress Rings) tidak pakai library chart — digambar
            manual dengan <Text className="font-semibold">react-native-svg</Text>. Cocok
            kalau butuh visualisasi yang tidak tersedia di library, atau butuh kontrol
            penuh atas styling & animation.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
