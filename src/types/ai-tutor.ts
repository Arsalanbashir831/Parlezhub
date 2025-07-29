export interface AITutorSettings {
  name: string;
  gender: 'male' | 'female' | 'neutral';
  avatar: string;
  context: string;
}

export interface AITutorEditState {
  isEditing: boolean;
  hasChanges: boolean;
}

export type EditableField = keyof Omit<AITutorSettings, 'avatar'>;
