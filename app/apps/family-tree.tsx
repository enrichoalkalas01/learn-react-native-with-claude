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
  useFamilyTree,
  type AddInput,
  type FamilyMember,
  type FamilyNode,
  type Gender,
} from '@/hooks/use-family-tree';

type FormState = {
  name: string;
  gender: Gender;
  birthYear: string;
  parentId: string | null;
  note: string;
};

const EMPTY_FORM: FormState = {
  name: '',
  gender: 'male',
  birthYear: '',
  parentId: null,
  note: '',
};

export default function FamilyTreeScreen() {
  const ft = useFamilyTree();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const openAddModal = (parentId: string | null) => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, parentId });
    setModalOpen(true);
  };

  const openEditModal = (m: FamilyMember) => {
    setEditingId(m.id);
    setForm({
      name: m.name,
      gender: m.gender,
      birthYear: m.birthYear ? String(m.birthYear) : '',
      parentId: m.parentId,
      note: m.note ?? '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = () => {
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
      note: form.note.trim() || undefined,
    };

    if (editingId) {
      ft.updateMember(editingId, payload);
    } else {
      ft.addMember(payload);
    }
    closeModal();
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
      {
        text: 'Hapus + naikkan anak',
        onPress: () => ft.deleteMember(m.id, 'promote'),
      },
      {
        text: 'Hapus semua keturunan',
        style: 'destructive',
        onPress: () => ft.deleteMember(m.id, 'cascade'),
      },
    ]);
  };

  const askReset = () => {
    Alert.alert('Reset silsilah?', 'Kembalikan ke data contoh awal.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: ft.resetTree },
    ]);
  };

  // Parent options untuk form: semua member kecuali diri sendiri + keturunan (saat edit).
  const invalidParentIds = useMemo(
    () => (editingId ? ft.getInvalidParentIds(editingId) : new Set<string>()),
    [editingId, ft]
  );
  const parentOptions = useMemo(
    () => ft.members.filter((m) => !invalidParentIds.has(m.id)),
    [ft.members, invalidParentIds]
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <ScrollView contentContainerClassName="p-4 gap-4 pb-24">
        <View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Silsilah Keluarga
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 mt-1">
            Pohon keluarga dengan CRUD — disimpan di AsyncStorage
          </Text>
        </View>

        {/* Stats */}
        <View className="flex-row gap-2">
          <StatCard label="Total" value={ft.stats.total} />
          <StatCard label="👨 Laki-laki" value={ft.stats.male} />
          <StatCard label="👩 Perempuan" value={ft.stats.female} />
          <StatCard label="Generasi" value={ft.stats.generations} />
        </View>

        {/* Tree */}
        {ft.tree.length === 0 ? (
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-8 items-center border border-dashed border-gray-200 dark:border-gray-700">
            <Text className="text-4xl mb-2">🌳</Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center mb-3">
              Pohon kosong. Tambah leluhur pertama.
            </Text>
            <Pressable
              onPress={() => openAddModal(null)}
              className="bg-primary px-5 py-2.5 rounded-xl active:opacity-70">
              <Text className="text-white font-semibold">+ Tambah Leluhur</Text>
            </Pressable>
          </View>
        ) : (
          <View className="gap-2">
            {ft.tree.map((node) => (
              <TreeBranch
                key={node.id}
                node={node}
                expanded={ft.expanded}
                onToggle={ft.toggleExpand}
                onAddChild={openAddModal}
                onEdit={openEditModal}
                onDelete={askDelete}
              />
            ))}
          </View>
        )}

        {/* Footer actions */}
        <View className="gap-2 mt-2">
          <Pressable
            onPress={() => openAddModal(null)}
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

      {/* Modal form */}
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
              {/* Nama */}
              <Field label="Nama">
                <TextInput
                  value={form.name}
                  onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
                  placeholder="cth: Pak Karto"
                  placeholderTextColor="#9ca3af"
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                />
              </Field>

              {/* Jenis kelamin */}
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
                          className={`font-medium ${
                            active ? 'text-white' : 'text-gray-700 dark:text-gray-200'
                          }`}>
                          {g === 'male' ? '👨 Laki-laki' : '👩 Perempuan'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Field>

              {/* Tahun lahir */}
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

              {/* Parent */}
              <Field label="Orang Tua (opsional)">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerClassName="gap-2"
                  keyboardShouldPersistTaps="handled">
                  <ParentChip
                    active={form.parentId === null}
                    onPress={() => setForm((f) => ({ ...f, parentId: null }))}
                    label="— Leluhur —"
                  />
                  {parentOptions.map((m) => (
                    <ParentChip
                      key={m.id}
                      active={form.parentId === m.id}
                      onPress={() => setForm((f) => ({ ...f, parentId: m.id }))}
                      label={`${m.gender === 'male' ? '👨' : '👩'} ${m.name}`}
                    />
                  ))}
                </ScrollView>
              </Field>

              {/* Catatan */}
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
                  onPress={closeModal}
                  className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl py-3 items-center active:bg-gray-100 dark:active:bg-gray-800">
                  <Text className="text-gray-700 dark:text-gray-200 font-medium">
                    Batal
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleSubmit}
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-700">
      <Text className="text-[11px] text-gray-500 dark:text-gray-400" numberOfLines={1}>
        {label}
      </Text>
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

function ParentChip({
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
        className={`text-sm font-medium ${
          active ? 'text-white' : 'text-gray-700 dark:text-gray-200'
        }`}>
        {label}
      </Text>
    </Pressable>
  );
}

type TreeBranchProps = {
  node: FamilyNode;
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
  onAddChild: (parentId: string | null) => void;
  onEdit: (m: FamilyMember) => void;
  onDelete: (m: FamilyMember) => void;
};

function TreeBranch({
  node,
  expanded,
  onToggle,
  onAddChild,
  onEdit,
  onDelete,
}: TreeBranchProps) {
  // default: expand semuanya. expanded[id] === false berarti user collapse manual.
  const isOpen = expanded[node.id] !== false;
  const hasChildren = node.children.length > 0;
  const accent =
    node.gender === 'male'
      ? 'border-l-blue-400 dark:border-l-blue-500'
      : 'border-l-pink-400 dark:border-l-pink-500';

  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      exiting={FadeOut.duration(120)}
      layout={LinearTransition.duration(200)}>
      <View
        className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 border-l-4 ${accent} p-3`}>
        <View className="flex-row items-center gap-2">
          {hasChildren ? (
            <Pressable
              onPress={() => onToggle(node.id)}
              className="w-7 h-7 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 active:opacity-70">
              <Text className="text-gray-600 dark:text-gray-300 text-xs">
                {isOpen ? '▼' : '▶'}
              </Text>
            </Pressable>
          ) : (
            <View className="w-7 h-7 items-center justify-center">
              <Text className="text-gray-300 dark:text-gray-600 text-xs">•</Text>
            </View>
          )}

          <Text className="text-xl">{node.gender === 'male' ? '👨' : '👩'}</Text>

          <View className="flex-1">
            <Text className="text-base font-bold text-gray-900 dark:text-white">
              {node.name}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Generasi {node.generation + 1}
              {node.birthYear ? ` · ${node.birthYear}` : ''}
              {hasChildren ? ` · ${node.children.length} anak` : ''}
            </Text>
          </View>
        </View>

        {node.note ? (
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-9 italic">
            “{node.note}”
          </Text>
        ) : null}

        <View className="flex-row gap-1.5 mt-3 ml-9">
          <IconBtn label="+ Anak" tone="primary" onPress={() => onAddChild(node.id)} />
          <IconBtn label="Edit" tone="neutral" onPress={() => onEdit(node)} />
          <IconBtn label="Hapus" tone="danger" onPress={() => onDelete(node)} />
        </View>
      </View>

      {isOpen && hasChildren ? (
        <View className="ml-5 mt-2 pl-3 border-l-2 border-gray-200 dark:border-gray-700 gap-2">
          {node.children.map((child) => (
            <TreeBranch
              key={child.id}
              node={child}
              expanded={expanded}
              onToggle={onToggle}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </View>
      ) : null}
    </Animated.View>
  );
}

function IconBtn({
  label,
  tone,
  onPress,
}: {
  label: string;
  tone: 'primary' | 'neutral' | 'danger';
  onPress: () => void;
}) {
  const style =
    tone === 'primary'
      ? 'bg-primary'
      : tone === 'danger'
        ? 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800'
        : 'bg-gray-100 dark:bg-gray-700';
  const textStyle =
    tone === 'primary'
      ? 'text-white'
      : tone === 'danger'
        ? 'text-red-600 dark:text-red-300'
        : 'text-gray-700 dark:text-gray-200';
  return (
    <Pressable
      onPress={onPress}
      className={`px-3 py-1.5 rounded-lg active:opacity-70 ${style}`}>
      <Text className={`text-xs font-semibold ${textStyle}`}>{label}</Text>
    </Pressable>
  );
}
