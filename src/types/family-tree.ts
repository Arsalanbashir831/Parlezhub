export interface FamilyMember {
  id: string; // UUID
  name: string;
  gender: 'male' | 'female' | 'other' | null;
  birth_date: string | null; // YYYY-MM-DD
  birth_time: string | null; // HH:MM:SS
  birth_place: string | null;
  is_connected?: boolean;
  connected_user_details?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  } | null;
  created_at: string; // ISO DateTime
  updated_at: string; // ISO DateTime
}

export interface FamilyTreeUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
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
