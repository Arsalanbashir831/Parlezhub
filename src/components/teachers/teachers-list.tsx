'use client';

import React from 'react';

import { TeacherCard, TeacherData } from './teacher-card';

interface TeachersListProps {
  teachers: TeacherData[];
  onSelectTeacher: (teacher: TeacherData) => void;
}

export const TeachersList = React.memo<TeachersListProps>(
  ({ teachers, onSelectTeacher }) => {
    return (
      <div className="flex flex-col gap-4">
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

TeachersList.displayName = 'TeachersList';
