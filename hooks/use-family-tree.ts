import { useMemo, useState } from 'react';
import { useStoredState } from '@/hooks/use-stored-state';

export type Gender = 'male' | 'female';

export type FamilyMember = {
  id: string;
  name: string;
  gender: Gender;
  birthYear?: number;
  parentId: string | null;
  note?: string;
};

export type FamilyNode = FamilyMember & {
  children: FamilyNode[];
  generation: number;
};

const SEED: FamilyMember[] = [
  {
    id: 'k1',
    name: 'Pak Karto',
    gender: 'male',
    birthYear: 1940,
    parentId: null,
    note: 'Kakek dari ayah',
  },
  {
    id: 'k2',
    name: 'Bu Sari',
    gender: 'female',
    birthYear: 1945,
    parentId: null,
    note: 'Nenek dari ayah',
  },
  {
    id: 'a1',
    name: 'Pak Budi',
    gender: 'male',
    birthYear: 1968,
    parentId: 'k1',
    note: 'Anak pertama',
  },
  { id: 'a2', name: 'Bu Wati', gender: 'female', birthYear: 1972, parentId: 'k1' },
  { id: 'c1', name: 'Andi', gender: 'male', birthYear: 1995, parentId: 'a1' },
  { id: 'c2', name: 'Dewi', gender: 'female', birthYear: 1998, parentId: 'a1' },
  { id: 'c3', name: 'Rina', gender: 'female', birthYear: 2000, parentId: 'a2' },
];

export type AddInput = Omit<FamilyMember, 'id'>;
export type UpdateInput = Partial<Omit<FamilyMember, 'id'>>;

export function useFamilyTree() {
  const [members, setMembers] = useStoredState<FamilyMember[]>('@app/family-tree', SEED);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Hitung tree (forest) dari list flat. Tiap root = member tanpa parent.
  const tree = useMemo<FamilyNode[]>(() => {
    const byParent = new Map<string | null, FamilyMember[]>();
    for (const m of members) {
      const key = m.parentId;
      if (!byParent.has(key)) byParent.set(key, []);
      byParent.get(key)!.push(m);
    }

    const build = (m: FamilyMember, generation: number): FamilyNode => ({
      ...m,
      generation,
      children: (byParent.get(m.id) ?? [])
        .sort((a, b) => (a.birthYear ?? 0) - (b.birthYear ?? 0))
        .map((child) => build(child, generation + 1)),
    });

    return (byParent.get(null) ?? [])
      .sort((a, b) => (a.birthYear ?? 0) - (b.birthYear ?? 0))
      .map((root) => build(root, 0));
  }, [members]);

  const generationCount = useMemo(() => {
    let max = 0;
    const walk = (nodes: FamilyNode[]) => {
      for (const n of nodes) {
        if (n.generation > max) max = n.generation;
        walk(n.children);
      }
    };
    walk(tree);
    return tree.length > 0 ? max + 1 : 0;
  }, [tree]);

  const stats = useMemo(() => {
    const male = members.filter((m) => m.gender === 'male').length;
    const female = members.filter((m) => m.gender === 'female').length;
    return { total: members.length, male, female, generations: generationCount };
  }, [members, generationCount]);

  const addMember = (input: AddInput) => {
    const id = `m_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    setMembers((prev) => [...prev, { ...input, id }]);
    return id;
  };

  const updateMember = (id: string, patch: UpdateInput) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  // mode 'cascade' = ikut hapus seluruh keturunan
  // mode 'promote' = anak-anak naik 1 level ke parent yang dihapus
  const deleteMember = (id: string, mode: 'cascade' | 'promote' = 'promote') => {
    setMembers((prev) => {
      const target = prev.find((m) => m.id === id);
      if (!target) return prev;

      if (mode === 'promote') {
        return prev
          .filter((m) => m.id !== id)
          .map((m) => (m.parentId === id ? { ...m, parentId: target.parentId } : m));
      }

      // cascade: kumpulkan semua descendant id
      const descendants = new Set<string>([id]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const m of prev) {
          if (m.parentId && descendants.has(m.parentId) && !descendants.has(m.id)) {
            descendants.add(m.id);
            changed = true;
          }
        }
      }
      return prev.filter((m) => !descendants.has(m.id));
    });
  };

  // Cek calon parent: tidak boleh dirinya sendiri atau keturunannya
  const getInvalidParentIds = (memberId: string): Set<string> => {
    const invalid = new Set<string>([memberId]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const m of members) {
        if (m.parentId && invalid.has(m.parentId) && !invalid.has(m.id)) {
          invalid.add(m.id);
          changed = true;
        }
      }
    }
    return invalid;
  };

  const hasChildren = (id: string) => members.some((m) => m.parentId === id);

  const getById = (id: string | null | undefined) =>
    id ? (members.find((m) => m.id === id) ?? null) : null;

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const resetTree = () => setMembers(SEED);

  return {
    members,
    tree,
    stats,
    expanded,
    addMember,
    updateMember,
    deleteMember,
    getInvalidParentIds,
    hasChildren,
    getById,
    toggleExpand,
    resetTree,
  };
}
