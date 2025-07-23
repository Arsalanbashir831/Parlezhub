"use client";

import React from "react";
import { TeacherCard, TeacherData } from "./teacher-card";

interface TeachersGridProps {
	teachers: TeacherData[];
	onSelectTeacher: (teacher: TeacherData) => void;
}

export const TeachersGrid = React.memo<TeachersGridProps>(
	({ teachers, onSelectTeacher }) => {
		return (
			<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
				{teachers.map((teacher) => (
					<TeacherCard
						key={teacher.id}
						teacher={teacher}
						onSelectTeacher={onSelectTeacher}
					/>
				))}
			</div>
		);
	}
);

TeachersGrid.displayName = "TeachersGrid";
