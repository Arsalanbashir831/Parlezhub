export interface FamilyMember {
  id: string; // UUID
  name: string;
  gender: 'male' | 'female' | 'other' | null;
  birth_date: string | null; // YYYY-MM-DD
  birth_time: string | null; // HH:MM:SS
  birth_place: string | null;
  created_at: string; // ISO DateTime
  updated_at: string; // ISO DateTime
}

export interface FamilyRelationship {
  id: string; // UUID
  from_id: string; // profile_id (the member whose relation is being defined)
  to_id: string; // relative_id (the parent or spouse)
  type: 'parent' | 'spouse';
}

export interface FamilyTreeResponse {
  nodes: FamilyMember[];
  edges: FamilyRelationship[];
}
