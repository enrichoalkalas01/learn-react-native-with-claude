import { useMemo, useState } from 'react';
import { useStoredState } from '@/hooks/use-stored-state';

export type Gender = 'male' | 'female';

export type FamilyMember = {
  id: string;
  name: string;
  gender: Gender;
  birthYear?: number;
  parentId: string | null;
  spouseId?: string | null;
  note?: string;
};

export type PersonNode = {
  type: 'person';
  member: FamilyMember;
  children: TreeNode[];
  generation: number;
};

export type CoupleNode = {
  type: 'couple';
  id: string; // "{primaryId}+{spouseId}" — stable composite id
  primary: FamilyMember;
  spouse: FamilyMember;
  children: TreeNode[];
  generation: number;
};

export type TreeNode = PersonNode | CoupleNode;

const SEED: FamilyMember[] = [
  // Generasi 1 — pasangan kakek nenek (couple group)
  {
    id: 'k1',
    name: 'Pak Karto',
    gender: 'male',
    birthYear: 1940,
    parentId: null,
    spouseId: 'k2',
    note: 'Kakek dari ayah',
  },
  {
    id: 'k2',
    name: 'Bu Sari',
    gender: 'female',
    birthYear: 1945,
    parentId: null,
    spouseId: 'k1',
    note: 'Nenek dari ayah',
  },

  // Generasi 2 — Pak Budi (anak k1+k2) menikah dgn Bu Lina (menikah masuk)
  {
    id: 'a1',
    name: 'Pak Budi',
    gender: 'male',
    birthYear: 1968,
    parentId: 'k1',
    spouseId: 'a1w',
  },
  {
    id: 'a1w',
    name: 'Bu Lina',
    gender: 'female',
    birthYear: 1970,
    parentId: null,
    spouseId: 'a1',
    note: 'Menikah masuk',
  },

  // Generasi 2 — Bu Wati (anak k1+k2) cerai → tampil sendiri
  {
    id: 'a2',
    name: 'Bu Wati',
    gender: 'female',
    birthYear: 1972,
    parentId: 'k1',
    note: 'Cerai, single parent',
  },

  // Generasi 3 — anak dari pasangan Budi+Lina
  {
    id: 'c1',
    name: 'Andi',
    gender: 'male',
    birthYear: 1995,
    parentId: 'a1',
    spouseId: 'c1w',
  },
  {
    id: 'c1w',
    name: 'Maya',
    gender: 'female',
    birthYear: 1996,
    parentId: null,
    spouseId: 'c1',
  },
  { id: 'c2', name: 'Dewi', gender: 'female', birthYear: 1998, parentId: 'a1' },

  // Generasi 3 — anak dari Bu Wati (sendiri)
  { id: 'c3', name: 'Rina', gender: 'female', birthYear: 2000, parentId: 'a2' },

  // Generasi 4 — anak Andi+Maya
  { id: 'd1', name: 'Kenzo', gender: 'male', birthYear: 2022, parentId: 'c1' },
];

export type AddInput = Omit<FamilyMember, 'id'>;
export type UpdateInput = Partial<Omit<FamilyMember, 'id'>>;

// Cek apakah 2 member adalah pasangan yang saling mengakui
function isMutualSpouse(a: FamilyMember, members: FamilyMember[]): FamilyMember | null {
  if (!a.spouseId) return null;
  const b = members.find((m) => m.id === a.spouseId);
  if (!b) return null;
  if (b.spouseId !== a.id) return null;
  return b;
}

export function useFamilyTreeV2() {
  const [members, setMembers] = useStoredState<FamilyMember[]>(
    '@app/family-tree-v2',
    SEED
  );
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Build tree dengan grouping pasangan
  const tree = useMemo<TreeNode[]>(() => {
    const consumed = new Set<string>();
    const childrenByParent = new Map<string | null, FamilyMember[]>();
    for (const m of members) {
      const key = m.parentId;
      if (!childrenByParent.has(key)) childrenByParent.set(key, []);
      childrenByParent.get(key)!.push(m);
    }

    const buildNode = (m: FamilyMember, generation: number): TreeNode => {
      consumed.add(m.id);
      const spouse = isMutualSpouse(m, members);

      // Couple group: anak diambil dari kedua belah pihak
      if (spouse && !consumed.has(spouse.id)) {
        consumed.add(spouse.id);
        const kidsA = childrenByParent.get(m.id) ?? [];
        const kidsB = childrenByParent.get(spouse.id) ?? [];
        const merged = [...kidsA, ...kidsB]
          .filter((c) => !consumed.has(c.id))
          .sort((a, b) => (a.birthYear ?? 0) - (b.birthYear ?? 0));

        return {
          type: 'couple',
          id: `${m.id}+${spouse.id}`,
          primary: m,
          spouse,
          generation,
          children: merged.map((c) => buildNode(c, generation + 1)),
        };
      }

      // Person node (single, atau spouse-nya sudah dikonsumsi di-render sebagai sibling root)
      const kids = (childrenByParent.get(m.id) ?? [])
        .filter((c) => !consumed.has(c.id))
        .sort((a, b) => (a.birthYear ?? 0) - (b.birthYear ?? 0));

      return {
        type: 'person',
        member: m,
        generation,
        children: kids.map((c) => buildNode(c, generation + 1)),
      };
    };

    const roots = members
      .filter((m) => m.parentId === null)
      .sort((a, b) => (a.birthYear ?? 0) - (b.birthYear ?? 0));

    const result: TreeNode[] = [];
    for (const root of roots) {
      if (consumed.has(root.id)) continue;
      result.push(buildNode(root, 0));
    }
    return result;
  }, [members]);

  const stats = useMemo(() => {
    const male = members.filter((m) => m.gender === 'male').length;
    const female = members.filter((m) => m.gender === 'female').length;
    let couples = 0;
    const seen = new Set<string>();
    for (const m of members) {
      if (seen.has(m.id)) continue;
      const s = isMutualSpouse(m, members);
      if (s) {
        couples++;
        seen.add(m.id);
        seen.add(s.id);
      }
    }
    let maxGen = 0;
    const walk = (nodes: TreeNode[]) => {
      for (const n of nodes) {
        if (n.generation > maxGen) maxGen = n.generation;
        walk(n.children);
      }
    };
    walk(tree);
    return {
      total: members.length,
      male,
      female,
      couples,
      generations: members.length > 0 ? maxGen + 1 : 0,
    };
  }, [members, tree]);

  // Add member + sinkron spouse (bidirectional)
  const addMember = (input: AddInput) => {
    const id = `m_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    setMembers((prev) => {
      const next = [...prev, { ...input, id }];
      if (input.spouseId) {
        return next.map((m) => {
          if (m.id === input.spouseId) {
            return { ...m, spouseId: id };
          }
          // putuskan link spouse lama dari calon pasangan
          if (m.id !== id && m.spouseId === input.spouseId) {
            return { ...m, spouseId: null };
          }
          return m;
        });
      }
      return next;
    });
    return id;
  };

  const updateMember = (id: string, patch: UpdateInput) => {
    setMembers((prev) => {
      const member = prev.find((m) => m.id === id);
      if (!member) return prev;
      const newSpouseId = patch.spouseId ?? member.spouseId;

      return prev.map((m) => {
        if (m.id === id) return { ...m, ...patch };

        // Sinkron spouse
        if (patch.spouseId !== undefined) {
          // Lepas link dari mantan pasangan
          if (member.spouseId && m.id === member.spouseId && newSpouseId !== m.id) {
            return { ...m, spouseId: null };
          }
          // Calon pasangan baru: lepas link lama mereka, lalu set ke `id`
          if (newSpouseId && m.id === newSpouseId) {
            return { ...m, spouseId: id };
          }
          // Putuskan link orang lain yang sebelumnya pasangan calon baru
          if (newSpouseId && m.spouseId === newSpouseId && m.id !== id) {
            return { ...m, spouseId: null };
          }
        }
        return m;
      });
    });
  };

  const deleteMember = (id: string, mode: 'cascade' | 'promote' = 'promote') => {
    setMembers((prev) => {
      const target = prev.find((m) => m.id === id);
      if (!target) return prev;

      const clearSpouseLink = (m: FamilyMember): FamilyMember =>
        m.spouseId === id ? { ...m, spouseId: null } : m;

      if (mode === 'promote') {
        return prev
          .filter((m) => m.id !== id)
          .map(clearSpouseLink)
          .map((m) => (m.parentId === id ? { ...m, parentId: target.parentId } : m));
      }

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
      return prev
        .filter((m) => !descendants.has(m.id))
        .map((m) =>
          m.spouseId && descendants.has(m.spouseId) ? { ...m, spouseId: null } : m
        );
    });
  };

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

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isCollapsed = (id: string) => Boolean(collapsed[id]);

  const resetTree = () => {
    setMembers(SEED);
    setCollapsed({});
  };

  return {
    members,
    tree,
    stats,
    addMember,
    updateMember,
    deleteMember,
    getInvalidParentIds,
    hasChildren,
    getById,
    toggleCollapse,
    isCollapsed,
    resetTree,
  };
}
