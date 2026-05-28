import { useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';

import {
  useFamilyTreeV2,
  type AddInput,
  type CoupleNode,
  type FamilyMember,
  type Gender,
  type PersonNode,
  type TreeNode,
} from '@/hooks/use-family-tree-v2';

// ===== Layout constants =====
const NODE_W = 140;
const COUPLE_W = 260;
const NODE_H = 90;
const H_GAP = 28;
const V_GAP = 90;
const CANVAS_PADDING = 80;

type LayoutItem = {
  node: TreeNode;
  x: number;
  y: number;
  w: number;
  h: number;
  parentAnchor: { x: number; y: number } | null; // bottom-center of own card
  topAnchor: { x: number; y: number }; // top-center of own card
};

type LayoutResult = {
  items: LayoutItem[];
  edges: { fromX: number; fromY: number; toX: number; toY: number }[];
  width: number;
  height: number;
};

// ===== Auto layout: tree walk yang pusatkan parent di tengah anak-anaknya =====
function buildLayout(roots: TreeNode[]): LayoutResult {
  const items: LayoutItem[] = [];
  const edges: { fromX: number; fromY: number; toX: number; toY: number }[] = [];
  let cursor = CANVAS_PADDING;

  const widthOf = (n: TreeNode) => (n.type === 'couple' ? COUPLE_W : NODE_W);

  type Placement = { x: number; w: number };

  const place = (node: TreeNode, depth: number): Placement => {
    const myW = widthOf(node);
    const myY = CANVAS_PADDING + depth * (NODE_H + V_GAP);
    let myX: number;

    if (node.children.length === 0) {
      myX = cursor;
      cursor += myW + H_GAP;
    } else {
      const childPlacements = node.children.map((child) => place(child, depth + 1));
      const first = childPlacements[0];
      const last = childPlacements[childPlacements.length - 1];
      const spanCenter = (first.x + last.x + last.w) / 2;
      myX = spanCenter - myW / 2;
      // Kalau parent malah lebih lebar dari rentang anak (mis. 1 anak doang),
      // pastikan parent tidak overlap dengan sibling sebelumnya
      if (myX < first.x - H_GAP) {
        const shift = first.x - H_GAP - myX;
        cursor += shift;
      }
    }

    const item: LayoutItem = {
      node,
      x: myX,
      y: myY,
      w: myW,
      h: NODE_H,
      parentAnchor: { x: myX + myW / 2, y: myY + NODE_H },
      topAnchor: { x: myX + myW / 2, y: myY },
    };
    items.push(item);

    // Edge dari node ini ke tiap anak
    for (const child of node.children) {
      const childItem = items.find((i) => i.node === child);
      if (childItem) {
        edges.push({
          fromX: item.parentAnchor!.x,
          fromY: item.parentAnchor!.y,
          toX: childItem.topAnchor.x,
          toY: childItem.topAnchor.y,
        });
      }
    }

    return { x: myX, w: myW };
  };

  for (const root of roots) {
    place(root, 0);
    cursor += H_GAP; // jarak antar forest root
  }

  const width = Math.max(...items.map((i) => i.x + i.w), 0) + CANVAS_PADDING;
  const height = Math.max(...items.map((i) => i.y + i.h), 0) + CANVAS_PADDING;
  return { items, edges, width, height };
}

// ===== Form state =====
type FormState = {
  name: string;
  gender: Gender;
  birthYear: string;
  parentId: string | null;
  spouseId: string | null;
  note: string;
};

const EMPTY_FORM: FormState = {
  name: '',
  gender: 'male',
  birthYear: '',
  parentId: null,
  spouseId: null,
  note: '',
};

export default function FamilyTreeFlowScreen() {
  const ft = useFamilyTreeV2();
  const layout = useMemo(() => buildLayout(ft.tree), [ft.tree]);

  // Pan + zoom shared values
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);
  const savedScale = useSharedValue(1);

  const screen = Dimensions.get('window');

  const panGesture = Gesture.Pan()
    .minDistance(8)
    .onStart(() => {
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    })
    .onUpdate((e) => {
      tx.value = savedTx.value + e.translationX;
      ty.value = savedTy.value + e.translationY;
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((e) => {
      const next = savedScale.value * e.scale;
      scale.value = Math.max(0.4, Math.min(2.2, next));
    });

  const composed = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedCanvas = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  const resetView = () => {
    tx.value = withTiming(0, { duration: 250 });
    ty.value = withTiming(0, { duration: 250 });
    scale.value = withTiming(1, { duration: 250 });
  };

  const fitToScreen = () => {
    if (layout.width === 0) return;
    const sx = (screen.width - 40) / layout.width;
    const sy = (screen.height - 240) / layout.height;
    const s = Math.min(sx, sy, 1);
    scale.value = withTiming(Math.max(0.4, s), { duration: 250 });
    tx.value = withTiming(0, { duration: 250 });
    ty.value = withTiming(0, { duration: 250 });
  };

  // ===== Modal form =====
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const openAdd = (parentId: string | null) => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, parentId });
    setModalOpen(true);
  };
  const openEdit = (m: FamilyMember) => {
    setEditingId(m.id);
    setForm({
      name: m.name,
      gender: m.gender,
      birthYear: m.birthYear ? String(m.birthYear) : '',
      parentId: m.parentId,
      spouseId: m.spouseId ?? null,
      note: m.note ?? '',
    });
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const submit = () => {
    const name = form.name.trim();
    if (!name) {
      Alert.alert('Nama wajib diisi');
      return;
    }
    const year = form.birthYear.trim() ? Number(form.birthYear.trim()) : undefined;
    if (year !== undefined && (isNaN(year) || year < 1800 || year > 2200)) {
      Alert.alert('Tahun lahir tidak valid');
      return;
    }
    const payload: AddInput = {
      name,
      gender: form.gender,
      birthYear: year,
      parentId: form.parentId,
      spouseId: form.spouseId,
      note: form.note.trim() || undefined,
    };
    if (editingId) ft.updateMember(editingId, payload);
    else ft.addMember(payload);
    closeModal();
  };

  const openMenu = (m: FamilyMember) => {
    Alert.alert(m.name, `Aksi untuk ${m.name}`, [
      { text: 'Batal', style: 'cancel' },
      { text: '+ Tambah Anak', onPress: () => openAdd(m.id) },
      { text: 'Edit', onPress: () => openEdit(m) },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          const hasKids = ft.hasChildren(m.id);
          if (!hasKids) {
            ft.deleteMember(m.id, 'promote');
            return;
          }
          Alert.alert('Punya keturunan', `"${m.name}" punya anak. Pilih:`, [
            { text: 'Batal', style: 'cancel' },
            { text: 'Naikkan anak', onPress: () => ft.deleteMember(m.id, 'promote') },
            {
              text: 'Cascade',
              style: 'destructive',
              onPress: () => ft.deleteMember(m.id, 'cascade'),
            },
          ]);
        },
      },
    ]);
  };

  const invalidParents = useMemo(
    () => (editingId ? ft.getInvalidParentIds(editingId) : new Set<string>()),
    [editingId, ft]
  );
  const parentOptions = useMemo(
    () => ft.members.filter((m) => !invalidParents.has(m.id)),
    [ft.members, invalidParents]
  );
  const spouseOptions = useMemo(
    () => ft.members.filter((m) => !invalidParents.has(m.id) && m.id !== form.parentId),
    [ft.members, invalidParents, form.parentId]
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      {/* Top bar */}
      <View className="px-4 pt-3 pb-2 flex-row items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <View>
          <Text className="text-base font-bold text-gray-900 dark:text-white">
            🌐 Flow View
          </Text>
          <Text className="text-[11px] text-gray-500 dark:text-gray-400">
            Pan: 1-jari · Zoom: 2-jari pinch · Tap node = aksi
          </Text>
        </View>
        <View className="flex-row gap-1.5">
          <TopBtn label="Fit" onPress={fitToScreen} />
          <TopBtn label="Reset" onPress={resetView} />
          <TopBtn label="+ Add" onPress={() => openAdd(null)} primary />
        </View>
      </View>

      {/* Canvas viewport */}
      <View className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-950">
        <GestureDetector gesture={composed}>
          <Animated.View
            style={[
              {
                position: 'absolute',
                left: 0,
                top: 0,
                width: layout.width || screen.width,
                height: layout.height || 400,
              },
              animatedCanvas,
            ]}>
            {/* Grid background untuk feel "infinite canvas" */}
            <GridBackground
              width={layout.width || screen.width}
              height={layout.height || 400}
            />

            {/* SVG edges (lines) */}
            <Svg
              width={layout.width || screen.width}
              height={layout.height || 400}
              style={{ position: 'absolute', left: 0, top: 0 }}>
              {layout.edges.map((e, i) => {
                const midY = (e.fromY + e.toY) / 2;
                const d = `M ${e.fromX} ${e.fromY} L ${e.fromX} ${midY} L ${e.toX} ${midY} L ${e.toX} ${e.toY}`;
                return (
                  <Path key={i} d={d} stroke="#9ca3af" strokeWidth={2} fill="none" />
                );
              })}
            </Svg>

            {/* Nodes (absolutely positioned cards) */}
            {layout.items.map((item) => (
              <FlowNode
                key={nodeKey(item.node)}
                item={item}
                onTapPerson={openMenu}
                onAddChild={(parentId) => openAdd(parentId)}
              />
            ))}

            {layout.items.length === 0 ? (
              <View
                style={{ position: 'absolute', left: 20, top: 80 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-dashed border-gray-200 dark:border-gray-700">
                <Text className="text-4xl text-center mb-2">🌳</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-center">
                  Pohon kosong — tap + Add di atas
                </Text>
              </View>
            ) : null}
          </Animated.View>
        </GestureDetector>

        {/* Hint mini panel */}
        <View className="absolute bottom-3 left-3 right-3 bg-white/95 dark:bg-gray-900/95 rounded-xl p-2.5 border border-gray-200 dark:border-gray-700 flex-row items-center justify-between">
          <Text className="text-[11px] text-gray-500 dark:text-gray-400">
            {layout.items.length} node · {layout.edges.length} edge
          </Text>
          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center gap-1">
              <View className="w-3 h-3 rounded-sm bg-rose-300" />
              <Text className="text-[10px] text-gray-500 dark:text-gray-400">
                Pasangan
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <View className="w-3 h-3 rounded-sm bg-blue-300" />
              <Text className="text-[10px] text-gray-500 dark:text-gray-400">Single</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Add/Edit modal — same shape as v2 */}
      <Modal
        visible={modalOpen}
        animationType="slide"
        transparent
        onRequestClose={closeModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-gray-900 rounded-t-3xl max-h-[90%]">
            <View className="px-5 pt-5 pb-3 flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800">
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                {editingId ? 'Edit Anggota' : 'Tambah Anggota'}
              </Text>
              <Pressable
                onPress={closeModal}
                className="w-8 h-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <Text className="text-gray-500 dark:text-gray-400 text-base">×</Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerClassName="p-5 gap-4"
              keyboardShouldPersistTaps="handled">
              <Field label="Nama">
                <TextInput
                  value={form.name}
                  onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
                  placeholder="cth: Pak Karto"
                  placeholderTextColor="#9ca3af"
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                />
              </Field>

              <Field label="Jenis Kelamin">
                <View className="flex-row gap-2">
                  {(['male', 'female'] as const).map((g) => {
                    const active = form.gender === g;
                    return (
                      <Pressable
                        key={g}
                        onPress={() => setForm((f) => ({ ...f, gender: g }))}
                        className={`flex-1 rounded-xl py-3 items-center border ${
                          active
                            ? 'bg-primary border-primary'
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        }`}>
                        <Text
                          className={`font-medium ${active ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`}>
                          {g === 'male' ? '👨 Laki-laki' : '👩 Perempuan'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Field>

              <Field label="Tahun Lahir (opsional)">
                <TextInput
                  value={form.birthYear}
                  onChangeText={(v) =>
                    setForm((f) => ({ ...f, birthYear: v.replace(/[^0-9]/g, '') }))
                  }
                  placeholder="cth: 1990"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                  maxLength={4}
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                />
              </Field>

              <Field label="Orang Tua">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerClassName="gap-2"
                  keyboardShouldPersistTaps="handled">
                  <Chip
                    active={form.parentId === null}
                    onPress={() => setForm((f) => ({ ...f, parentId: null }))}
                    label="— Leluhur —"
                  />
                  {parentOptions.map((m) => (
                    <Chip
                      key={m.id}
                      active={form.parentId === m.id}
                      onPress={() => setForm((f) => ({ ...f, parentId: m.id }))}
                      label={`${m.gender === 'male' ? '👨' : '👩'} ${m.name}`}
                    />
                  ))}
                </ScrollView>
              </Field>

              <Field label="Pasangan (opsional)">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerClassName="gap-2"
                  keyboardShouldPersistTaps="handled">
                  <Chip
                    active={form.spouseId === null}
                    onPress={() => setForm((f) => ({ ...f, spouseId: null }))}
                    label="— Tanpa pasangan —"
                  />
                  {spouseOptions.map((m) => (
                    <Chip
                      key={m.id}
                      active={form.spouseId === m.id}
                      onPress={() => setForm((f) => ({ ...f, spouseId: m.id }))}
                      label={`${m.gender === 'male' ? '👨' : '👩'} ${m.name}`}
                    />
                  ))}
                </ScrollView>
              </Field>

              <Field label="Catatan (opsional)">
                <TextInput
                  value={form.note}
                  onChangeText={(v) => setForm((f) => ({ ...f, note: v }))}
                  placeholder="cth: anak sulung"
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white min-h-[80px]"
                />
              </Field>

              <View className="flex-row gap-2 mt-2">
                <Pressable
                  onPress={closeModal}
                  className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl py-3 items-center active:bg-gray-100 dark:active:bg-gray-800">
                  <Text className="text-gray-700 dark:text-gray-200 font-medium">
                    Batal
                  </Text>
                </Pressable>
                <Pressable
                  onPress={submit}
                  className="flex-1 bg-primary rounded-xl py-3 items-center active:opacity-70">
                  <Text className="text-white font-semibold">
                    {editingId ? 'Simpan' : 'Tambah'}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function nodeKey(node: TreeNode): string {
  return node.type === 'couple' ? node.id : node.member.id;
}

// ===== UI subcomponents =====

function TopBtn({
  label,
  onPress,
  primary,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-3 py-1.5 rounded-lg active:opacity-70 ${
        primary
          ? 'bg-primary'
          : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
      }`}>
      <Text
        className={`text-xs font-semibold ${
          primary ? 'text-white' : 'text-gray-700 dark:text-gray-200'
        }`}>
        {label}
      </Text>
    </Pressable>
  );
}

function GridBackground({ width, height }: { width: number; height: number }) {
  // Pattern dot grid via SVG
  const dots: { x: number; y: number }[] = [];
  const step = 24;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      dots.push({ x, y });
    }
  }
  return (
    <Svg width={width} height={height} style={{ position: 'absolute', left: 0, top: 0 }}>
      {dots.map((d, i) => (
        <Path
          key={i}
          d={`M ${d.x} ${d.y} L ${d.x + 0.5} ${d.y}`}
          stroke="#e5e7eb"
          strokeWidth={1.5}
        />
      ))}
    </Svg>
  );
}

function FlowNode({
  item,
  onTapPerson,
  onAddChild,
}: {
  item: LayoutItem;
  onTapPerson: (m: FamilyMember) => void;
  onAddChild: (parentId: string) => void;
}) {
  const { node, x, y, w, h } = item;

  if (node.type === 'couple') {
    return (
      <View
        style={{ position: 'absolute', left: x, top: y, width: w, height: h + 22 }}
        className="bg-white dark:bg-gray-800 rounded-xl border-2 border-rose-300 dark:border-rose-800/70 overflow-hidden">
        <View className="bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 flex-row items-center justify-between">
          <Text className="text-[10px] font-semibold text-rose-600 dark:text-rose-300">
            💑 Pasangan
          </Text>
          <Pressable
            hitSlop={6}
            onPress={() => onAddChild((node as CoupleNode).primary.id)}
            className="px-1.5 py-0.5 bg-primary rounded-md active:opacity-70">
            <Text className="text-[9px] font-bold text-white">+ Anak</Text>
          </Pressable>
        </View>
        <View className="flex-1 flex-row items-center px-1.5 gap-1">
          <FlowPerson
            member={(node as CoupleNode).primary}
            onPress={() => onTapPerson((node as CoupleNode).primary)}
          />
          <Text className="text-xs">❤️</Text>
          <FlowPerson
            member={(node as CoupleNode).spouse}
            onPress={() => onTapPerson((node as CoupleNode).spouse)}
          />
        </View>
      </View>
    );
  }

  const m = (node as PersonNode).member;
  const accent =
    m.gender === 'male'
      ? 'border-blue-300 dark:border-blue-700/60'
      : 'border-pink-300 dark:border-pink-700/60';

  return (
    <Pressable
      onPress={() => onTapPerson(m)}
      style={{ position: 'absolute', left: x, top: y, width: w, height: h }}
      className={`bg-white dark:bg-gray-800 rounded-xl border-2 ${accent} p-2 active:opacity-80`}>
      <View className="flex-row items-center gap-1.5">
        <Text className="text-xl">{m.gender === 'male' ? '👨' : '👩'}</Text>
        <Text
          className="flex-1 text-sm font-bold text-gray-900 dark:text-white"
          numberOfLines={1}>
          {m.name}
        </Text>
      </View>
      {m.birthYear ? (
        <Text className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
          b. {m.birthYear}
        </Text>
      ) : null}
      <Text className="text-[9px] text-gray-400 dark:text-gray-500 mt-auto">
        Gen {(node as PersonNode).generation + 1} · tap untuk aksi
      </Text>
    </Pressable>
  );
}

function FlowPerson({ member, onPress }: { member: FamilyMember; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-1 py-1 active:opacity-70">
      <View className="flex-row items-center gap-1">
        <Text className="text-base">{member.gender === 'male' ? '👨' : '👩'}</Text>
        <Text
          className="flex-1 text-xs font-bold text-gray-900 dark:text-white"
          numberOfLines={1}>
          {member.name}
        </Text>
      </View>
      {member.birthYear ? (
        <Text className="text-[9px] text-gray-500 dark:text-gray-400 ml-5">
          b. {member.birthYear}
        </Text>
      ) : null}
    </Pressable>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </Text>
      {children}
    </View>
  );
}

function Chip({
  active,
  onPress,
  label,
}: {
  active: boolean;
  onPress: () => void;
  label: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-3.5 py-2 rounded-full border ${
        active
          ? 'bg-primary border-primary'
          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}>
      <Text
        className={`text-sm font-medium ${active ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`}>
        {label}
      </Text>
    </Pressable>
  );
}
