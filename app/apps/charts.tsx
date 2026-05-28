import { ScrollView, Text, View } from 'react-native';
import {
  BarChart,
  LineChart,
  PieChart,
  PopulationPyramid,
} from 'react-native-gifted-charts';

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

function Legend({
  items,
}: {
  items: { color: string; label: string; value?: string }[];
}) {
  return (
    <View className="flex-row flex-wrap gap-x-4 gap-y-1.5 mt-3 justify-center">
      {items.map((item) => (
        <View key={item.label} className="flex-row items-center gap-1.5">
          <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
          <Text className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {item.label}
            {item.value ? (
              <Text className="text-gray-400 dark:text-gray-500"> · {item.value}</Text>
            ) : null}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ============================================================================
// DATA — Sample dataset untuk tiap chart
// ============================================================================

const LINE_BASIC = [
  { value: 50, label: 'Sen' },
  { value: 80, label: 'Sel' },
  { value: 45, label: 'Rab' },
  { value: 90, label: 'Kam' },
  { value: 70, label: 'Jum' },
  { value: 110, label: 'Sab' },
  { value: 95, label: 'Min' },
];

const LINE_AREA = [
  { value: 30, label: 'W1' },
  { value: 55, label: 'W2' },
  { value: 40, label: 'W3' },
  { value: 75, label: 'W4' },
  { value: 60, label: 'W5' },
  { value: 95, label: 'W6' },
  { value: 85, label: 'W7' },
];

const LINE_REVENUE = [
  { value: 20, label: 'Jan' },
  { value: 45, label: 'Feb' },
  { value: 35, label: 'Mar' },
  { value: 70, label: 'Apr' },
  { value: 55, label: 'Mei' },
  { value: 90, label: 'Jun' },
];

const LINE_EXPENSE = [
  { value: 15, label: 'Jan' },
  { value: 30, label: 'Feb' },
  { value: 25, label: 'Mar' },
  { value: 50, label: 'Apr' },
  { value: 40, label: 'Mei' },
  { value: 60, label: 'Jun' },
];

const BAR_BASIC = [
  { value: 35, label: 'Sen', frontColor: '#0a7ea4' },
  { value: 50, label: 'Sel', frontColor: '#0a7ea4' },
  { value: 28, label: 'Rab', frontColor: '#0a7ea4' },
  { value: 70, label: 'Kam', frontColor: '#0a7ea4' },
  { value: 45, label: 'Jum', frontColor: '#0a7ea4' },
];

const BAR_RANKED = [
  { value: 30, label: 'A', frontColor: '#22c55e' },
  { value: 55, label: 'B', frontColor: '#0a7ea4' },
  { value: 40, label: 'C', frontColor: '#f59e0b' },
  { value: 75, label: 'D', frontColor: '#ec4899' },
  { value: 60, label: 'E', frontColor: '#a855f7' },
];

const BAR_STACKED = [
  {
    label: 'Sen',
    stacks: [
      { value: 20, color: '#0a7ea4' },
      { value: 30, color: '#f59e0b' },
    ],
  },
  {
    label: 'Sel',
    stacks: [
      { value: 35, color: '#0a7ea4' },
      { value: 25, color: '#f59e0b' },
    ],
  },
  {
    label: 'Rab',
    stacks: [
      { value: 15, color: '#0a7ea4' },
      { value: 40, color: '#f59e0b' },
    ],
  },
  {
    label: 'Kam',
    stacks: [
      { value: 50, color: '#0a7ea4' },
      { value: 20, color: '#f59e0b' },
    ],
  },
  {
    label: 'Jum',
    stacks: [
      { value: 30, color: '#0a7ea4' },
      { value: 35, color: '#f59e0b' },
    ],
  },
];

const PIE_BASIC = [
  { value: 40, color: '#0a7ea4', text: '40%' },
  { value: 25, color: '#f59e0b', text: '25%' },
  { value: 20, color: '#22c55e', text: '20%' },
  { value: 15, color: '#ec4899', text: '15%' },
];

const PIE_DONUT = [
  { value: 45, color: '#0a7ea4' },
  { value: 30, color: '#f59e0b' },
  { value: 15, color: '#22c55e' },
  { value: 10, color: '#a855f7' },
];

const PYRAMID = [
  { left: 12, right: 14 },
  { left: 18, right: 19 },
  { left: 22, right: 25 },
  { left: 28, right: 30 },
  { left: 24, right: 26 },
  { left: 16, right: 18 },
  { left: 10, right: 11 },
];

// ============================================================================
// SCREEN
// ============================================================================

export default function ChartsScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950">
      <View className="p-4 gap-4">
        {/* Header */}
        <View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Galeri Chart
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 mt-1">
            Berbagai jenis chart yang bisa dipakai di React Native pakai{' '}
            <Text className="font-semibold">react-native-gifted-charts</Text>.
          </Text>
        </View>

        {/* ============ LINE CHARTS ============ */}
        <ChartSection
          emoji="📈"
          title="Line Chart — Basic"
          description="Tracking sederhana per hari. Cocok untuk metric harian.">
          <LineChart
            data={LINE_BASIC}
            width={260}
            height={180}
            color="#0a7ea4"
            thickness={3}
            dataPointsColor="#0a7ea4"
            dataPointsRadius={5}
            yAxisColor="#e5e7eb"
            xAxisColor="#e5e7eb"
            yAxisTextStyle={{ color: '#9ca3af', fontSize: 10 }}
            xAxisLabelTextStyle={{ color: '#9ca3af', fontSize: 10 }}
            noOfSections={4}
            initialSpacing={10}
            spacing={36}
          />
        </ChartSection>

        <ChartSection
          emoji="🌊"
          title="Area Chart — Gradient Fill"
          description="Line dengan area gradient di bawah. Visual lebih kaya untuk dashboard.">
          <LineChart
            data={LINE_AREA}
            width={260}
            height={180}
            color="#22c55e"
            thickness={3}
            curved
            areaChart
            startFillColor="#22c55e"
            startOpacity={0.4}
            endFillColor="#22c55e"
            endOpacity={0.05}
            dataPointsColor="#22c55e"
            dataPointsRadius={4}
            yAxisColor="#e5e7eb"
            xAxisColor="#e5e7eb"
            yAxisTextStyle={{ color: '#9ca3af', fontSize: 10 }}
            xAxisLabelTextStyle={{ color: '#9ca3af', fontSize: 10 }}
            noOfSections={4}
            initialSpacing={10}
            spacing={36}
          />
        </ChartSection>

        <ChartSection
          emoji="📊"
          title="Multi-Line Chart"
          description="Bandingkan 2 dataset di chart yang sama. Misal: revenue vs expense.">
          <LineChart
            data={LINE_REVENUE}
            data2={LINE_EXPENSE}
            width={260}
            height={180}
            color="#0a7ea4"
            color2="#ec4899"
            thickness={3}
            curved
            dataPointsColor="#0a7ea4"
            dataPointsColor2="#ec4899"
            dataPointsRadius={4}
            yAxisColor="#e5e7eb"
            xAxisColor="#e5e7eb"
            yAxisTextStyle={{ color: '#9ca3af', fontSize: 10 }}
            xAxisLabelTextStyle={{ color: '#9ca3af', fontSize: 10 }}
            noOfSections={4}
            initialSpacing={10}
            spacing={42}
          />
          <Legend
            items={[
              { color: '#0a7ea4', label: 'Revenue' },
              { color: '#ec4899', label: 'Expense' },
            ]}
          />
        </ChartSection>

        {/* ============ BAR CHARTS ============ */}
        <ChartSection
          emoji="📊"
          title="Bar Chart — Basic"
          description="Klasik. Bandingkan nilai antar kategori dengan jelas.">
          <BarChart
            data={BAR_BASIC}
            width={260}
            height={180}
            barWidth={28}
            barBorderRadius={6}
            yAxisColor="#e5e7eb"
            xAxisColor="#e5e7eb"
            yAxisTextStyle={{ color: '#9ca3af', fontSize: 10 }}
            xAxisLabelTextStyle={{ color: '#9ca3af', fontSize: 10 }}
            noOfSections={4}
            initialSpacing={10}
            spacing={20}
          />
        </ChartSection>

        <ChartSection
          emoji="🎨"
          title="Bar Chart — Colored"
          description="Tiap bar warna berbeda. Cocok untuk ranking atau kategori berbeda.">
          <BarChart
            data={BAR_RANKED}
            width={260}
            height={180}
            barWidth={28}
            barBorderRadius={6}
            yAxisColor="#e5e7eb"
            xAxisColor="#e5e7eb"
            yAxisTextStyle={{ color: '#9ca3af', fontSize: 10 }}
            xAxisLabelTextStyle={{ color: '#9ca3af', fontSize: 10 }}
            noOfSections={4}
            initialSpacing={10}
            spacing={20}
          />
        </ChartSection>

        <ChartSection
          emoji="🥞"
          title="Stacked Bar Chart"
          description="Beberapa kategori ditumpuk dalam 1 bar. Lihat total + komposisi sekaligus.">
          <BarChart
            stackData={BAR_STACKED}
            width={260}
            height={180}
            barWidth={28}
            barBorderRadius={4}
            yAxisColor="#e5e7eb"
            xAxisColor="#e5e7eb"
            yAxisTextStyle={{ color: '#9ca3af', fontSize: 10 }}
            xAxisLabelTextStyle={{ color: '#9ca3af', fontSize: 10 }}
            noOfSections={4}
            initialSpacing={10}
            spacing={20}
          />
          <Legend
            items={[
              { color: '#0a7ea4', label: 'Online' },
              { color: '#f59e0b', label: 'Offline' },
            ]}
          />
        </ChartSection>

        {/* ============ PIE CHARTS ============ */}
        <ChartSection
          emoji="🥧"
          title="Pie Chart — Basic"
          description="Lingkaran penuh dengan persentase. Cocok untuk proporsi yang totalnya 100%.">
          <PieChart
            data={PIE_BASIC}
            radius={90}
            showText
            textColor="white"
            textSize={12}
            fontWeight="bold"
          />
          <Legend
            items={[
              { color: '#0a7ea4', label: 'Makanan', value: '40%' },
              { color: '#f59e0b', label: 'Transport', value: '25%' },
              { color: '#22c55e', label: 'Belanja', value: '20%' },
              { color: '#ec4899', label: 'Lainnya', value: '15%' },
            ]}
          />
        </ChartSection>

        <ChartSection
          emoji="🍩"
          title="Donut Chart — Center Label"
          description="Pie dengan lubang tengah. Space-nya bisa diisi total atau info penting.">
          <PieChart
            data={PIE_DONUT}
            radius={90}
            innerRadius={60}
            donut
            centerLabelComponent={() => (
              <View className="items-center">
                <Text className="text-[10px] text-gray-500 uppercase">Total</Text>
                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                  100
                </Text>
                <Text className="text-[10px] text-gray-400">tasks</Text>
              </View>
            )}
          />
          <Legend
            items={[
              { color: '#0a7ea4', label: 'Done', value: '45' },
              { color: '#f59e0b', label: 'Progress', value: '30' },
              { color: '#22c55e', label: 'Review', value: '15' },
              { color: '#a855f7', label: 'Todo', value: '10' },
            ]}
          />
        </ChartSection>

        <ChartSection
          emoji="🌗"
          title="Semi-Circle (Gauge)"
          description="Setengah lingkaran. Mirip gauge / speedometer untuk progress.">
          <PieChart
            data={PIE_DONUT}
            radius={100}
            innerRadius={70}
            donut
            semiCircle
            centerLabelComponent={() => (
              <View className="items-center" style={{ marginTop: 30 }}>
                <Text className="text-xl font-bold text-gray-900 dark:text-white">
                  72%
                </Text>
                <Text className="text-[10px] text-gray-500">progress</Text>
              </View>
            )}
          />
        </ChartSection>

        {/* ============ POPULATION PYRAMID ============ */}
        <ChartSection
          emoji="👥"
          title="Population Pyramid"
          description="Bandingkan 2 grup (misal: pria/wanita) per kategori. Horizontal mirroring.">
          <PopulationPyramid
            data={PYRAMID}
            width={260}
            leftBarColor="#0a7ea4"
            rightBarColor="#ec4899"
            showValuesAsBarLabels
            barLabelFontSize={9}
            barLabelColor="#fff"
          />
          <Legend
            items={[
              { color: '#0a7ea4', label: 'Pria' },
              { color: '#ec4899', label: 'Wanita' },
            ]}
          />
        </ChartSection>

        {/* ============ FOOTER NOTE ============ */}
        <View className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/40">
          <Text className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-1">
            💡 Tips
          </Text>
          <Text className="text-xs text-blue-800 dark:text-blue-300 leading-5">
            Semua chart di atas pakai library{' '}
            <Text className="font-semibold">react-native-gifted-charts</Text> (under the
            hood pakai <Text className="font-semibold">react-native-svg</Text>). Library
            ini punya API yang konsisten — props mirip antar chart. Untuk chart yang lebih
            kompleks (radar, scatter, heatmap), bisa pakai{' '}
            <Text className="font-semibold">Victory Native</Text> atau{' '}
            <Text className="font-semibold">react-native-skia</Text>.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
