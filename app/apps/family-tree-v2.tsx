import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import {
  useFamilyTreeV2,
  type AddInput,
  type CoupleNode,
  type FamilyMember,
  type Gender,
  type PersonNode,
  type TreeNode,
} from '@/hooks/use-family-tree-v2';

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

export default function FamilyTreeV2Screen() {
  const ft = useFamilyTreeV2();
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

  const close = () => {
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
    close();
  };

  const askDelete = (m: FamilyMember) => {
    const hasKids = ft.hasChildren(m.id);
    if (!hasKids) {
      Alert.alert('Hapus anggota?', `Yakin hapus "${m.name}"?`, [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => ft.deleteMember(m.id, 'promote'),
        },
      ]);
      return;
    }
    Alert.alert('Anggota punya keturunan', `"${m.name}" punya anak/cucu. Mau diapakan?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus + naikkan anak', onPress: () => ft.deleteMember(m.id, 'promote') },
      {
        text: 'Hapus semua keturunan',
        style: 'destructive',
        onPress: () => ft.deleteMember(m.id, 'cascade'),
      },
    ]);
  };

  const askUnpair = (a: FamilyMember, b: FamilyMember) => {
    Alert.alert(
      'Pisahkan pasangan?',
      `Cerai/pisah link "${a.name}" ↔ "${b.name}". Mereka akan tampil terpisah.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Pisahkan',
          style: 'destructive',
          onPress: () => ft.updateMember(a.id, { spouseId: null }),
        },
      ]
    );
  };

  const askReset = () => {
    Alert.alert('Reset silsilah?', 'Kembalikan ke data contoh awal.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: ft.resetTree },
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
  // Spouse options: exclude diri sendiri & semua descendant (cegah incest absurd) & beda gender opsional
  const spouseOptions = useMemo(
    () => ft.members.filter((m) => !invalidParents.has(m.id) && m.id !== form.parentId),
    [ft.members, invalidParents, form.parentId]
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <ScrollView contentContainerClassName="p-4 gap-4 pb-24">
        <View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Silsilah Keluarga v2
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 mt-1">
            Pasangan otomatis di-group jadi satu card. Single/cerai tampil sendiri.
          </Text>
        </View>

        {/* Stats */}
        <View className="flex-row gap-2 flex-wrap">
          <StatCard label="Total" value={ft.stats.total} icon="👥" />
          <StatCard label="Pasangan" value={ft.stats.couples} icon="💑" />
          <StatCard label="Generasi" value={ft.stats.generations} icon="🌳" />
        </View>

        {/* Tree */}
        {ft.tree.length === 0 ? (
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-8 items-center border border-dashed border-gray-200 dark:border-gray-700">
            <Text className="text-4xl mb-2">🌳</Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center mb-3">
              Pohon kosong. Tambah leluhur pertama.
            </Text>
            <Pressable
              onPress={() => openAdd(null)}
              className="bg-primary px-5 py-2.5 rounded-xl active:opacity-70">
              <Text className="text-white font-semibold">+ Tambah Leluhur</Text>
            </Pressable>
          </View>
        ) : (
          <View className="gap-2.5">
            {ft.tree.map((node) => (
              <Branch
                key={nodeKey(node)}
                node={node}
                onAdd={openAdd}
                onEdit={openEdit}
                onDelete={askDelete}
                onUnpair={askUnpair}
                isCollapsed={ft.isCollapsed}
                toggleCollapse={ft.toggleCollapse}
              />
            ))}
          </View>
        )}

        <View className="gap-2 mt-2">
          <Pressable
            onPress={() => openAdd(null)}
            className="bg-primary rounded-xl py-3.5 items-center active:opacity-70">
            <Text className="text-white font-semibold">+ Tambah Leluhur</Text>
          </Pressable>
          <Pressable
            onPress={askReset}
            className="border border-gray-200 dark:border-gray-700 rounded-xl py-3 items-center active:bg-gray-100 dark:active:bg-gray-800">
            <Text className="text-gray-600 dark:text-gray-300 font-medium">
              Reset ke contoh
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Form modal */}
      <Modal visible={modalOpen} animationType="slide" transparent onRequestClose={close}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-gray-900 rounded-t-3xl max-h-[90%]">
            <View className="px-5 pt-5 pb-3 flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800">
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                {editingId ? 'Edit Anggota' : 'Tambah Anggota'}
              </Text>
              <Pressable
                onPress={close}
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

              <Field label="Orang Tua (opsional)">
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
                <Text className="text-xs text-gray-400 dark:text-gray-500 -mt-1 mb-1">
                  Pilih untuk grouping di tree. Bisa diubah/lepas kapan saja.
                </Text>
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
                  placeholder="cth: anak sulung, lahir di Bandung"
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white min-h-[80px]"
                />
              </Field>

              <View className="flex-row gap-2 mt-2">
                <Pressable
                  onPress={close}
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

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <View className="flex-1 min-w-[100px] bg-white dark:bg-gray-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-700">
      <View className="flex-row items-center gap-1.5">
        <Text className="text-base">{icon}</Text>
        <Text className="text-[11px] text-gray-500 dark:text-gray-400" numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
        {value}
      </Text>
    </View>
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

type BranchProps = {
  node: TreeNode;
  onAdd: (parentId: string | null) => void;
  onEdit: (m: FamilyMember) => void;
  onDelete: (m: FamilyMember) => void;
  onUnpair: (a: FamilyMember, b: FamilyMember) => void;
  isCollapsed: (id: string) => boolean;
  toggleCollapse: (id: string) => void;
};

function Branch(props: BranchProps) {
  const { node } = props;
  const id = nodeKey(node);
  const collapsed = props.isCollapsed(id);
  const hasKids = node.children.length > 0;

  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      exiting={FadeOut.duration(120)}
      layout={LinearTransition.duration(200)}>
      {node.type === 'couple' ? (
        <CoupleCard
          node={node}
          collapsed={collapsed}
          onToggle={() => props.toggleCollapse(id)}
          onAddChild={() => props.onAdd(node.primary.id)}
          onEditPrimary={() => props.onEdit(node.primary)}
          onEditSpouse={() => props.onEdit(node.spouse)}
          onDeletePrimary={() => props.onDelete(node.primary)}
          onDeleteSpouse={() => props.onDelete(node.spouse)}
          onUnpair={() => props.onUnpair(node.primary, node.spouse)}
        />
      ) : (
        <PersonCard
          node={node}
          collapsed={collapsed}
          onToggle={() => props.toggleCollapse(id)}
          onAddChild={() => props.onAdd(node.member.id)}
          onEdit={() => props.onEdit(node.member)}
          onDelete={() => props.onDelete(node.member)}
        />
      )}

      {!collapsed && hasKids ? (
        <View className="ml-5 mt-2 pl-3 border-l-2 border-gray-200 dark:border-gray-700 gap-2.5">
          {node.children.map((child) => (
            <Branch key={nodeKey(child)} {...props} node={child} />
          ))}
        </View>
      ) : null}
    </Animated.View>
  );
}

function CoupleCard({
  node,
  collapsed,
  onToggle,
  onAddChild,
  onEditPrimary,
  onEditSpouse,
  onDeletePrimary,
  onDeleteSpouse,
  onUnpair,
}: {
  node: CoupleNode;
  collapsed: boolean;
  onToggle: () => void;
  onAddChild: () => void;
  onEditPrimary: () => void;
  onEditSpouse: () => void;
  onDeletePrimary: () => void;
  onDeleteSpouse: () => void;
  onUnpair: () => void;
}) {
  const hasKids = node.children.length > 0;
  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-rose-200 dark:border-rose-900/50 overflow-hidden">
      {/* Header: badge + collapse */}
      <View className="flex-row items-center justify-between px-3 pt-2.5 pb-1.5">
        <View className="flex-row items-center gap-1.5">
          <Text className="text-xs font-semibold text-rose-600 dark:text-rose-400">
            💑 Pasangan
          </Text>
          <Text className="text-xs text-gray-400 dark:text-gray-500">
            · Generasi {node.generation + 1}
          </Text>
        </View>
        {hasKids ? (
          <Pressable
            onPress={onToggle}
            className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 active:opacity-70">
            <Text className="text-[10px] text-gray-600 dark:text-gray-300 font-medium">
              {collapsed ? `▶ ${node.children.length} anak` : `▼ Tutup`}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {/* 2 person tiles side-by-side */}
      <View className="flex-row px-3 pb-3 gap-2">
        <PersonTile
          member={node.primary}
          onEdit={onEditPrimary}
          onDelete={onDeletePrimary}
        />
        <View className="items-center justify-center pt-6">
          <Text className="text-base">❤️</Text>
        </View>
        <PersonTile
          member={node.spouse}
          onEdit={onEditSpouse}
          onDelete={onDeleteSpouse}
        />
      </View>

      {/* Couple actions */}
      <View className="flex-row gap-1.5 px-3 pb-3 border-t border-gray-100 dark:border-gray-700 pt-2.5">
        <IconBtn label="+ Anak (mereka)" tone="primary" onPress={onAddChild} />
        <IconBtn label="Pisahkan" tone="warning" onPress={onUnpair} />
      </View>
    </View>
  );
}

function PersonTile({
  member,
  onEdit,
  onDelete,
}: {
  member: FamilyMember;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-2.5 border border-gray-100 dark:border-gray-700">
      <View className="flex-row items-center gap-1.5">
        <Text className="text-lg">{member.gender === 'male' ? '👨' : '👩'}</Text>
        <Text
          className="flex-1 text-sm font-bold text-gray-900 dark:text-white"
          numberOfLines={1}>
          {member.name}
        </Text>
      </View>
      {member.birthYear ? (
        <Text className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
          Lahir {member.birthYear}
        </Text>
      ) : null}
      {member.note ? (
        <Text
          className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 italic"
          numberOfLines={2}>
          “{member.note}”
        </Text>
      ) : null}
      <View className="flex-row gap-1 mt-2">
        <Pressable
          onPress={onEdit}
          className="flex-1 bg-white dark:bg-gray-700 rounded-md py-1 items-center border border-gray-200 dark:border-gray-600 active:opacity-70">
          <Text className="text-[10px] font-semibold text-gray-700 dark:text-gray-200">
            Edit
          </Text>
        </Pressable>
        <Pressable
          onPress={onDelete}
          className="flex-1 bg-red-50 dark:bg-red-900/30 rounded-md py-1 items-center border border-red-200 dark:border-red-800 active:opacity-70">
          <Text className="text-[10px] font-semibold text-red-600 dark:text-red-300">
            Hapus
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function PersonCard({
  node,
  collapsed,
  onToggle,
  onAddChild,
  onEdit,
  onDelete,
}: {
  node: PersonNode;
  collapsed: boolean;
  onToggle: () => void;
  onAddChild: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const m = node.member;
  const accent =
    m.gender === 'male'
      ? 'border-l-blue-400 dark:border-l-blue-500'
      : 'border-l-pink-400 dark:border-l-pink-500';
  const hasKids = node.children.length > 0;

  return (
    <View
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 border-l-4 ${accent} p-3`}>
      <View className="flex-row items-center gap-2">
        {hasKids ? (
          <Pressable
            onPress={onToggle}
            className="w-7 h-7 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 active:opacity-70">
            <Text className="text-gray-600 dark:text-gray-300 text-xs">
              {collapsed ? '▶' : '▼'}
            </Text>
          </Pressable>
        ) : (
          <View className="w-7 h-7 items-center justify-center">
            <Text className="text-gray-300 dark:text-gray-600 text-xs">•</Text>
          </View>
        )}

        <Text className="text-xl">{m.gender === 'male' ? '👨' : '👩'}</Text>

        <View className="flex-1">
          <Text className="text-base font-bold text-gray-900 dark:text-white">
            {m.name}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            Generasi {node.generation + 1}
            {m.birthYear ? ` · ${m.birthYear}` : ''}
            {hasKids ? ` · ${node.children.length} anak` : ''}
            {' · single'}
          </Text>
        </View>
      </View>

      {m.note ? (
        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-9 italic">
          “{m.note}”
        </Text>
      ) : null}

      <View className="flex-row gap-1.5 mt-3 ml-9">
        <IconBtn label="+ Anak" tone="primary" onPress={onAddChild} />
        <IconBtn label="Edit" tone="neutral" onPress={onEdit} />
        <IconBtn label="Hapus" tone="danger" onPress={onDelete} />
      </View>
    </View>
  );
}

function IconBtn({
  label,
  tone,
  onPress,
}: {
  label: string;
  tone: 'primary' | 'neutral' | 'danger' | 'warning';
  onPress: () => void;
}) {
  const style =
    tone === 'primary'
      ? 'bg-primary'
      : tone === 'danger'
        ? 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800'
        : tone === 'warning'
          ? 'bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800'
          : 'bg-gray-100 dark:bg-gray-700';
  const textStyle =
    tone === 'primary'
      ? 'text-white'
      : tone === 'danger'
        ? 'text-red-600 dark:text-red-300'
        : tone === 'warning'
          ? 'text-amber-700 dark:text-amber-300'
          : 'text-gray-700 dark:text-gray-200';
  return (
    <Pressable
      onPress={onPress}
      className={`px-3 py-1.5 rounded-lg active:opacity-70 ${style}`}>
      <Text className={`text-xs font-semibold ${textStyle}`}>{label}</Text>
    </Pressable>
  );
}
