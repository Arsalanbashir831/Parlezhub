'use client';

import { useTeachers } from '@/hooks/useTeachers';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MainContent } from '@/components/agents/language/main-content';
import { TeacherDetailsModal, TeachersList } from '@/components/teachers';

export default function LanguageAgentPage() {
  const {
    teachers,
    selectedTeacher,
    isModalOpen,
    handleCloseModal,
    handleSelectTeacher,
  } = useTeachers();

  return (
    <div className="flex flex-1">
      <ScrollArea className="h-[calc(100vh-4rem)] w-3/4 flex-1">
        <MainContent />
      </ScrollArea>
      <ScrollArea className="hidden h-[calc(100vh-4rem)] w-1/4 max-w-96 border-l border-gray-200 bg-white p-6 lg:block">
        <TeachersList
          teachers={teachers}
          onSelectTeacher={handleSelectTeacher}
        />
      </ScrollArea>

      <TeacherDetailsModal
        teacher={selectedTeacher}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
