import apiCaller from '@/lib/api-caller';
import { API_ROUTES } from '@/constants/api-routes';
import { FamilyMember, FamilyTreeResponse } from '@/types/family-tree';

class FamilyTreeService {
  async getFamilyTree(): Promise<FamilyTreeResponse> {
    const res = await apiCaller(API_ROUTES.FAMILY_TREE.BASE, 'GET');
    return res.data;
  }

  async createMember(payload: {
    name: string;
    gender: 'male' | 'female' | 'other' | null;
    birth_date: string | null;
    birth_time: string | null;
    birth_place: string | null;
  }): Promise<FamilyMember> {
    const res = await apiCaller(API_ROUTES.FAMILY_TREE.MEMBERS, 'POST', payload);
    return res.data;
  }

  async updateMember(
    uuid: string,
    payload: {
      name: string;
      gender: 'male' | 'female' | 'other' | null;
      birth_date: string | null;
      birth_time: string | null;
      birth_place: string | null;
    }
  ): Promise<FamilyMember> {
    const res = await apiCaller(API_ROUTES.FAMILY_TREE.MEMBER(uuid), 'PUT', payload);
    return res.data;
  }

  async deleteMember(uuid: string): Promise<void> {
    await apiCaller(API_ROUTES.FAMILY_TREE.MEMBER(uuid), 'DELETE');
  }

  async connectRelationship(payload: {
    profile_id: string;
    relative_id: string;
    relationship_type: 'parent' | 'spouse';
  }): Promise<void> {
    await apiCaller(API_ROUTES.FAMILY_TREE.RELATIONSHIPS, 'POST', payload);
  }

  async removeRelationship(payload: {
    profile_id: string;
    relative_id: string;
    relationship_type: 'parent' | 'spouse';
  }): Promise<void> {
    await apiCaller(API_ROUTES.FAMILY_TREE.REMOVE_RELATIONSHIP, 'POST', payload);
  }
}

export const familyTreeService = new FamilyTreeService();
export default familyTreeService;
