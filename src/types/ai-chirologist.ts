export interface AIChirologistSettings {
	name: string;
	gender: "male" | "female" | "neutral";
	avatar: string;
	context: string;
}

export interface AIChirologistEditState {
	isEditing: boolean;
	hasChanges: boolean;
}

export type EditableField = keyof Omit<AIChirologistSettings, "avatar">; 