import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  LinearTransition,
  cancelAnimation,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

// ============================================================================
// SHARED UI HELPERS
// ============================================================================

type SectionProps = {
  emoji: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

function Section({ emoji, title, description, children }: SectionProps) {
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

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'neutral' | 'danger';
};

function ActionButton({ label, onPress, variant = 'primary' }: ActionButtonProps) {
  const bg =
    variant === 'primary'
      ? 'bg-primary'
      : variant === 'danger'
        ? 'bg-red-500'
        : 'bg-gray-200 dark:bg-gray-700';
  const text = variant === 'neutral' ? 'text-gray-700 dark:text-gray-200' : 'text-white';
  return (
    <Pressable
      onPress={onPress}
      className={`${bg} px-4 py-2 rounded-lg active:opacity-70`}>
      <Text className={`${text} text-xs font-bold`}>{label}</Text>
    </Pressable>
  );
}

// ============================================================================
// 1. FADE — withTiming on opacity
// ============================================================================

function FadeSection() {
  const opacity = useSharedValue(1);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const toggle = () => {
    opacity.value = withTiming(opacity.value > 0.5 ? 0 : 1, { duration: 500 });
  };

  return (
    <Section
      emoji="🌫️"
      title="Fade In/Out"
      description="Animasi dasar: `withTiming` ubah opacity dari 0 ke 1.">
      <Animated.View style={[style, styles.box, { backgroundColor: '#0a7ea4' }]}>
        <Text className="text-white font-bold">Hello</Text>
      </Animated.View>
      <View className="mt-3">
        <ActionButton label="Toggle Fade" onPress={toggle} />
      </View>
    </Section>
  );
}

// ============================================================================
// 2. SPRING SCALE — withSpring
// ============================================================================

function SpringScaleSection() {
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pop = () => {
    scale.value = withSequence(
      withSpring(1.4, { damping: 4, stiffness: 200 }),
      withSpring(1, { damping: 8 })
    );
  };

  return (
    <Section
      emoji="🎈"
      title="Spring Scale"
      description="Physics-based bouncy. `withSpring` pakai damping & stiffness, bukan duration.">
      <Animated.View style={[style, styles.box, { backgroundColor: '#f59e0b' }]}>
        <Text className="text-white font-bold text-2xl">🎈</Text>
      </Animated.View>
      <View className="mt-3">
        <ActionButton label="Pop!" onPress={pop} />
      </View>
    </Section>
  );
}

// ============================================================================
// 3. ROTATE — full 360 rotation
// ============================================================================

function RotateSection() {
  const rotation = useSharedValue(0);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const spin = () => {
    rotation.value = withTiming(rotation.value + 360, {
      duration: 700,
      easing: Easing.inOut(Easing.cubic),
    });
  };

  return (
    <Section
      emoji="🔄"
      title="Rotate"
      description="Animasi sudut. `${value}deg` pakai template string di transform.">
      <Animated.View style={[style, styles.box, { backgroundColor: '#22c55e' }]}>
        <Text className="text-white font-bold text-2xl">⚙️</Text>
      </Animated.View>
      <View className="mt-3">
        <ActionButton label="Spin 360°" onPress={spin} />
      </View>
    </Section>
  );
}

// ============================================================================
// 4. FLIP CARD 3D — rotateY with perspective
// ============================================================================

function FlipCardSection() {
  const rotation = useSharedValue(0);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${rotation.value}deg` }],
    backfaceVisibility: 'hidden',
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${rotation.value + 180}deg` }],
    backfaceVisibility: 'hidden',
  }));

  const flip = () => {
    rotation.value = withTiming(rotation.value + 180, { duration: 600 });
  };

  return (
    <Section
      emoji="🃏"
      title="Flip Card 3D"
      description="Rotasi sumbu Y + perspective. `backfaceVisibility: hidden` sembunyikan belakang.">
      <View style={styles.cardContainer}>
        <Animated.View style={[styles.card, frontStyle, { backgroundColor: '#0a7ea4' }]}>
          <Text className="text-white font-bold">FRONT</Text>
          <Text className="text-white/70 text-xs mt-1">tap untuk flip</Text>
        </Animated.View>
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            backStyle,
            { backgroundColor: '#ec4899' },
          ]}>
          <Text className="text-white font-bold">BACK</Text>
          <Text className="text-white/70 text-xs mt-1">side belakang</Text>
        </Animated.View>
      </View>
      <View className="mt-3">
        <ActionButton label="Flip Card" onPress={flip} />
      </View>
    </Section>
  );
}

// ============================================================================
// 5. EASING COMPARISON — same animation, 4 different easings
// ============================================================================

function EasingComparisonSection() {
  const linear = useSharedValue(0);
  const ease = useSharedValue(0);
  const bounce = useSharedValue(0);
  const elastic = useSharedValue(0);

  const reset = (v: typeof linear) => (v.value = 0);

  const play = () => {
    [linear, ease, bounce, elastic].forEach(reset);
    linear.value = withTiming(1, { duration: 1500, easing: Easing.linear });
    ease.value = withTiming(1, {
      duration: 1500,
      easing: Easing.inOut(Easing.cubic),
    });
    bounce.value = withTiming(1, {
      duration: 1500,
      easing: Easing.bounce,
    });
    elastic.value = withTiming(1, {
      duration: 1500,
      easing: Easing.elastic(1.5),
    });
  };

  const linearStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(linear.value, [0, 1], [0, 180]) }],
  }));
  const easeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(ease.value, [0, 1], [0, 180]) }],
  }));
  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(bounce.value, [0, 1], [0, 180]) }],
  }));
  const elasticStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(elastic.value, [0, 1], [0, 180]) }],
  }));

  const rows = [
    { label: 'Linear', style: linearStyle, color: '#94a3b8' },
    { label: 'Ease', style: easeStyle, color: '#0a7ea4' },
    { label: 'Bounce', style: bounceStyle, color: '#f59e0b' },
    { label: 'Elastic', style: elasticStyle, color: '#ec4899' },
  ];

  return (
    <Section
      emoji="🎢"
      title="Easing Comparison"
      description="Animasi sama, easing beda. Lihat efek timing curve.">
      <View className="w-full gap-2">
        {rows.map((row) => (
          <View key={row.label} className="flex-row items-center gap-2">
            <Text className="text-xs font-medium text-gray-600 dark:text-gray-300 w-14">
              {row.label}
            </Text>
            <View className="flex-1 h-7 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
              <Animated.View
                style={[
                  row.style,
                  { width: 24, height: 24, borderRadius: 12, marginTop: 2 },
                  { backgroundColor: row.color },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
      <View className="mt-3">
        <ActionButton label="Play All" onPress={play} />
      </View>
    </Section>
  );
}

// ============================================================================
// 6. SHAKE — withSequence horizontal
// ============================================================================

function ShakeSection() {
  const translateX = useSharedValue(0);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const shake = () => {
    translateX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-4, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  return (
    <Section
      emoji="💥"
      title="Shake (Error Feedback)"
      description="`withSequence` jalankan beberapa animasi berurutan. Cocok untuk validation error.">
      <Animated.View style={[style, styles.box, { backgroundColor: '#ef4444' }]}>
        <Text className="text-white font-bold text-2xl">!</Text>
      </Animated.View>
      <View className="mt-3">
        <ActionButton label="Shake" onPress={shake} variant="danger" />
      </View>
    </Section>
  );
}

// ============================================================================
// 7. PULSE / HEARTBEAT — withRepeat loop
// ============================================================================

function PulseSection() {
  const scale = useSharedValue(1);
  const [running, setRunning] = useState(false);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const toggle = () => {
    if (running) {
      cancelAnimation(scale);
      scale.value = withTiming(1, { duration: 200 });
      setRunning(false);
    } else {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 600, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.in(Easing.ease) })
        ),
        -1
      );
      setRunning(true);
    }
  };

  return (
    <Section
      emoji="❤️"
      title="Pulse / Heartbeat (Loop)"
      description="`withRepeat(anim, -1)` ulang infinite. `cancelAnimation` untuk stop manual.">
      <Animated.View style={[style, styles.box, { backgroundColor: '#ec4899' }]}>
        <Text className="text-white text-3xl">❤️</Text>
      </Animated.View>
      <View className="mt-3">
        <ActionButton
          label={running ? 'Stop' : 'Start Pulse'}
          onPress={toggle}
          variant={running ? 'danger' : 'primary'}
        />
      </View>
    </Section>
  );
}

// ============================================================================
// 8. SKELETON SHIMMER — gradient slide loop
// ============================================================================

function SkeletonSection() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.linear }),
      -1,
      false
    );
    return () => cancelAnimation(progress);
  }, [progress]);

  const shimmer = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0, 1], [-150, 250]) }],
  }));

  const SkelLine = ({ width }: { width: number | string }) => (
    <View
      style={{ width: width as number, height: 12 }}
      className="bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
      <Animated.View
        style={[shimmer, { width: 80, height: 12, backgroundColor: '#ffffff80' }]}
      />
    </View>
  );

  return (
    <Section
      emoji="✨"
      title="Skeleton Shimmer Loader"
      description="Pattern loading state. Box abu-abu + highlight bergerak terus.">
      <View className="w-full bg-gray-50 dark:bg-gray-900 p-3 rounded-xl gap-2">
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <Animated.View
              style={[shimmer, { width: 80, height: 48, backgroundColor: '#ffffff80' }]}
            />
          </View>
          <View className="flex-1 gap-1.5">
            <SkelLine width={120} />
            <SkelLine width={80} />
          </View>
        </View>
        <SkelLine width={'100%' as never} />
        <SkelLine width={180} />
      </View>
    </Section>
  );
}

// ============================================================================
// 9. ANIMATED COUNTER — number counts up
// ============================================================================

function CounterSection() {
  const [value, setValue] = useState(0);
  const target = 12500;

  const animateTo = (to: number) => {
    const from = value;
    const duration = 1500;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(from + (to - from) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    tick();
  };

  return (
    <Section
      emoji="🔢"
      title="Animated Counter"
      description="Angka naik halus pakai `requestAnimationFrame` + ease-out cubic.">
      <View className="items-center py-3">
        <Text className="text-4xl font-bold text-primary">
          {value.toLocaleString('id-ID')}
        </Text>
        <Text className="text-xs text-gray-500 mt-1">followers</Text>
      </View>
      <View className="flex-row gap-2 mt-2">
        <ActionButton
          label={`Count to ${target.toLocaleString('id-ID')}`}
          onPress={() => animateTo(target)}
        />
        <ActionButton label="Reset" onPress={() => animateTo(0)} variant="neutral" />
      </View>
    </Section>
  );
}

// ============================================================================
// 10. COLOR MORPH — interpolateColor with stepper
// ============================================================================

function ColorMorphSection() {
  const progress = useSharedValue(0);
  const [level, setLevel] = useState(0);

  const style = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 0.33, 0.66, 1],
      ['#22c55e', '#facc15', '#f97316', '#ef4444']
    ),
  }));

  const setStep = (step: number) => {
    setLevel(step);
    progress.value = withTiming(step / 3, { duration: 400 });
  };

  const labels = ['Safe', 'Warning', 'Danger', 'Critical'];

  return (
    <Section
      emoji="🎨"
      title="Color Morph"
      description="`interpolateColor` smooth transition antar warna berdasarkan progress value.">
      <Animated.View style={[style, styles.box, { width: 200, height: 60 }]}>
        <Text className="text-white font-bold text-lg">{labels[level]}</Text>
      </Animated.View>
      <View className="flex-row gap-1.5 mt-3">
        {labels.map((label, i) => (
          <Pressable
            key={label}
            onPress={() => setStep(i)}
            className={`px-2.5 py-1.5 rounded-md border ${
              level === i
                ? 'bg-primary border-primary'
                : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
            }`}>
            <Text
              className={`text-[10px] font-medium ${
                level === i ? 'text-white' : 'text-gray-600 dark:text-gray-300'
              }`}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
    </Section>
  );
}

// ============================================================================
// 11. PROGRESS BAR — animated width
// ============================================================================

function ProgressBarSection() {
  const progress = useSharedValue(0);
  const [percent, setPercent] = useState(0);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const colorStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 0.5, 1],
      ['#ef4444', '#f59e0b', '#22c55e']
    ),
  }));

  const animate = (to: number) => {
    progress.value = withTiming(to / 100, { duration: 800 });
    setPercent(to);
  };

  return (
    <Section
      emoji="📊"
      title="Animated Progress Bar"
      description="Width + color transition. Useful untuk upload/download indicator.">
      <View className="w-full">
        <View className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <Animated.View style={[barStyle, colorStyle, { height: '100%' }]} />
        </View>
        <Text className="text-center mt-2 text-sm font-bold text-gray-900 dark:text-white">
          {percent}%
        </Text>
      </View>
      <View className="flex-row gap-2 mt-2 flex-wrap justify-center">
        {[0, 25, 50, 75, 100].map((p) => (
          <Pressable
            key={p}
            onPress={() => animate(p)}
            className={`px-3 py-1.5 rounded-md ${
              percent === p ? 'bg-primary' : 'bg-gray-100 dark:bg-gray-700'
            }`}>
            <Text
              className={`text-xs font-medium ${
                percent === p ? 'text-white' : 'text-gray-700 dark:text-gray-200'
              }`}>
              {p}%
            </Text>
          </Pressable>
        ))}
      </View>
    </Section>
  );
}

// ============================================================================
// 12. DRAGGABLE BOX — pan gesture
// ============================================================================

function DraggableSection() {
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
      { scale: scale.value },
    ],
  }));

  const pan = Gesture.Pan()
    .onBegin(() => {
      scale.value = withSpring(1.1);
    })
    .onUpdate((e) => {
      offsetX.value = e.translationX;
      offsetY.value = e.translationY;
    })
    .onEnd(() => {
      offsetX.value = withSpring(0, { damping: 12 });
      offsetY.value = withSpring(0, { damping: 12 });
      scale.value = withSpring(1);
    });

  return (
    <Section
      emoji="✋"
      title="Draggable Box (Pan Gesture)"
      description="Drag box ke mana saja. Lepas → spring kembali ke posisi semula.">
      <View
        className="bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700"
        style={{
          width: 260,
          height: 180,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <GestureDetector gesture={pan}>
          <Animated.View style={[style, styles.box, { backgroundColor: '#a855f7' }]}>
            <Text className="text-white font-bold">DRAG</Text>
          </Animated.View>
        </GestureDetector>
      </View>
    </Section>
  );
}

// ============================================================================
// 13. SWIPE-TO-DELETE + LAYOUT ANIMATION LIST
// ============================================================================

type Item = { id: string; text: string };
let nextId = 100;

const INITIAL_ITEMS: Item[] = [
  { id: '1', text: '🍕 Order pizza' },
  { id: '2', text: '🛒 Belanja mingguan' },
  { id: '3', text: '📚 Baca buku' },
  { id: '4', text: '🏃 Olahraga sore' },
];

function SwipeRow({ item, onDelete }: { item: Item; onDelete: (id: string) => void }) {
  const translateX = useSharedValue(0);
  const SWIPE_THRESHOLD = 120;

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const trashStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0.2], 'clamp'),
  }));

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      translateX.value = Math.min(0, e.translationX);
    })
    .onEnd((e) => {
      if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-400, { duration: 200 }, () => {
          runOnJS(onDelete)(item.id);
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      layout={LinearTransition.duration(250)}
      style={{ position: 'relative' }}>
      <Animated.View
        style={[
          trashStyle,
          {
            position: 'absolute',
            right: 16,
            top: 0,
            bottom: 0,
            justifyContent: 'center',
          },
        ]}>
        <Text className="text-2xl">🗑️</Text>
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View
          style={style}
          className="bg-white dark:bg-gray-700 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-600">
          <Text className="text-gray-900 dark:text-white font-medium">{item.text}</Text>
          <Text className="text-[10px] text-gray-400 mt-0.5">
            ← swipe kiri untuk hapus
          </Text>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

function SwipeListSection() {
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);

  const addItem = () => {
    const samples = [
      '🎵 Dengar musik',
      '☕ Bikin kopi',
      '🌱 Siram tanaman',
      '📱 Cek notifikasi',
      '🎮 Main game',
    ];
    const text = samples[Math.floor(Math.random() * samples.length)];
    setItems((prev) => [{ id: String(nextId++), text }, ...prev]);
  };

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const reset = () => setItems(INITIAL_ITEMS);

  return (
    <Section
      emoji="↔️"
      title="Swipe-to-Delete + Layout Animation"
      description="Pan gesture + threshold + FadeIn/Out + LinearTransition. Combo gesture + layout animation.">
      <View className="w-full bg-gray-50 dark:bg-gray-900 rounded-xl p-3 gap-2 min-h-[100px]">
        {items.length === 0 ? (
          <Text className="text-center text-gray-400 py-4">Semua dihapus 🎉</Text>
        ) : (
          items.map((item) => <SwipeRow key={item.id} item={item} onDelete={remove} />)
        )}
      </View>
      <View className="flex-row gap-2 mt-3">
        <ActionButton label="+ Tambah" onPress={addItem} />
        <ActionButton label="Reset" onPress={reset} variant="neutral" />
      </View>
    </Section>
  );
}

// ============================================================================
// MAIN SCREEN
// ============================================================================

export default function AnimationsScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950">
      <View className="p-4 gap-4">
        <View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Galeri Animasi
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 mt-1">
            13 demo animasi dengan Reanimated 4 — basic, gesture, layout, dan efek
            populer.
          </Text>
        </View>

        {/* Group 1: Basic transforms */}
        <Text className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-2">
          Basic Transforms
        </Text>
        <FadeSection />
        <SpringScaleSection />
        <RotateSection />
        <FlipCardSection />

        {/* Group 2: Timing & sequencing */}
        <Text className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-2">
          Timing & Sequencing
        </Text>
        <EasingComparisonSection />
        <ShakeSection />
        <PulseSection />
        <SkeletonSection />

        {/* Group 3: Value interpolation */}
        <Text className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-2">
          Value Interpolation
        </Text>
        <CounterSection />
        <ColorMorphSection />
        <ProgressBarSection />

        {/* Group 4: Gesture + Layout */}
        <Text className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-2">
          Gesture & Layout
        </Text>
        <DraggableSection />
        <SwipeListSection />

        {/* Footer note */}
        <View className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/40">
          <Text className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-1">
            💡 Tentang Reanimated 4
          </Text>
          <Text className="text-xs text-blue-800 dark:text-blue-300 leading-5">
            Semua animasi di halaman ini jalan di{' '}
            <Text className="font-semibold">UI thread</Text> (60fps) — bukan JS thread.
            Jadi animasi tetap smooth walau JS thread sibuk (loading data, parsing JSON,
            dll). Untuk animasi sederhana, RN punya API{' '}
            <Text className="font-semibold">Animated</Text> bawaan, tapi Reanimated
            direkomendasikan untuk performa lebih baik.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  box: {
    width: 100,
    height: 100,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    width: 200,
    height: 120,
    position: 'relative',
  },
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBack: {
    // no-op, marker
  },
});
