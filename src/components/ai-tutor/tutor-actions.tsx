"use client";

import { Play, Edit, Save, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TutorActionsProps {
	isEditing: boolean;
	isSaving: boolean;
	hasChanges: boolean;
	isValid: boolean;
	onStartSession: () => void;
	onEdit: () => void;
	onSave: () => void;
	onCancel: () => void;
}

export default function TutorActions({
	isEditing,
	isSaving,
	hasChanges,
	isValid,
	onStartSession,
	onEdit,
	onSave,
	onCancel,
}: TutorActionsProps) {
	if (isEditing) {
		return (
			<div className="flex items-center gap-3">
				<Button
					onClick={onCancel}
					variant="outline"
					disabled={isSaving}
					className="gap-2">
					<X className="h-4 w-4" />
					Cancel
				</Button>
				<Button
					onClick={onSave}
					disabled={!hasChanges || !isValid || isSaving}
					className="gap-2">
					{isSaving ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<Save className="h-4 w-4" />
					)}
					{isSaving ? "Saving..." : "Save Changes"}
				</Button>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-3">
			<Button onClick={onEdit} variant="outline" className="gap-2">
				<Edit className="h-4 w-4" />
				Edit Settings
			</Button>
			<Button onClick={onStartSession} size="lg" className="gap-2">
				<Play className="h-4 w-4" />
				Start Session
			</Button>
		</div>
	);
}
