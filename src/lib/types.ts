export type UserRole = "student" | "teacher";

export interface User {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	role: UserRole;
	city: string;
	country: string;
	postalCode: string;
	address: string;
	qualification?: string; // Only for teachers
	isVerified: boolean;
	avatar?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface AIAvatar {
	id: string;
	userId: string;
	name: string;
	image: string;
	gender: "male" | "female" | "neutral";
	accent: string;
	language: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface Conversation {
	id: string;
	userId: string;
	avatarId?: string;
	teacherId?: string;
	messages: Message[];
	duration: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface Message {
	id: string;
	conversationId: string;
	senderId: string;
	content: string;
	type: "text" | "audio" | "image";
	timestamp: Date;
}

export interface Meeting {
	id: string;
	studentId: string;
	teacherId: string;
	title: string;
	description?: string;
	scheduledAt: Date;
	duration: number;
	status: "scheduled" | "completed" | "cancelled";
	meetingLink?: string;
	createdAt: Date;
}

export interface ConversationReport {
	id: string;
	conversationId: string;
	userId: string;
	summary: string;
	improvements: string[];
	score: number;
	duration: number;
	wordsSpoken: number;
	createdAt: Date;
}
