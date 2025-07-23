"use client";

import {
	TeachersHeader,
	TeacherFilters,
	TeachersGrid,
	TeachersEmptyState,
	TeacherDetailsPanel,
} from "@/components/teachers";
import { useTeachers } from "@/hooks/useTeachers";

export default function TeachersPage() {
	const {
		teachers,
		availableLanguages,
		searchQuery,
		selectedLanguage,
		priceRange,
		showFilters,
		selectedTeacher,
		isDetailsPanelOpen,
		handleSearchChange,
		handleLanguageChange,
		handlePriceRangeChange,
		handleToggleFilters,
		handleClearFilters,
		handleSelectTeacher,
		handleClosDetailsPanel,
	} = useTeachers();

	return (
		<div className="space-y-8">
			<TeachersHeader />

			<TeacherFilters
				searchQuery={searchQuery}
				selectedLanguage={selectedLanguage}
				priceRange={priceRange}
				showFilters={showFilters}
				resultsCount={teachers.length}
				availableLanguages={availableLanguages}
				onSearchChange={handleSearchChange}
				onLanguageChange={handleLanguageChange}
				onPriceRangeChange={handlePriceRangeChange}
				onToggleFilters={handleToggleFilters}
				onClearFilters={handleClearFilters}
			/>

			{teachers.length > 0 ? (
				<TeachersGrid
					teachers={teachers}
					onSelectTeacher={handleSelectTeacher}
				/>
			) : (
				<TeachersEmptyState onClearFilters={handleClearFilters} />
			)}

			<TeacherDetailsPanel
				teacher={selectedTeacher}
				isOpen={isDetailsPanelOpen}
				onClose={handleClosDetailsPanel}
			/>
		</div>
	);
}
