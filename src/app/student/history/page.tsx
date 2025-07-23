"use client";

import {
	HistoryStats,
	HistoryFilters,
	ConversationList,
	HistoryEmptyState,
	LoadMore,
} from "@/components/history";
import { useConversationHistory } from "@/hooks/useConversationHistory";

export default function ConversationsPage() {
	const {
		conversations,
		totalStats,
		availableLanguages,
		isLoading,
		searchQuery,
		selectedLanguage,
		sortBy,
		handleViewReport,
		handleStartNewConversation,
		handleLoadMore,
		handleSearchChange,
		handleLanguageChange,
		handleSortChange,
	} = useConversationHistory();

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold text-gray-900">All Conversations</h1>
				<p className="text-gray-600">
					Review your AI conversation history and progress
				</p>
			</div>

			{/* Stats Overview */}
			<HistoryStats
				totalConversations={totalStats.totalConversations}
				totalMinutes={totalStats.totalMinutes}
				totalWords={totalStats.totalWords}
			/>

			{/* Filters */}
			<HistoryFilters
				searchQuery={searchQuery}
				selectedLanguage={selectedLanguage}
				sortBy={sortBy}
				onSearchChange={handleSearchChange}
				onLanguageChange={handleLanguageChange}
				onSortChange={handleSortChange}
				availableLanguages={availableLanguages}
			/>

			{/* Conversations List */}
			{conversations.length > 0 ? (
				<>
					<ConversationList
						conversations={conversations}
						onViewReport={handleViewReport}
					/>
					<LoadMore
						onLoadMore={handleLoadMore}
						isLoading={isLoading}
						hasMore={conversations.length >= 5}
					/>
				</>
			) : (
				<HistoryEmptyState
					onStartNewConversation={handleStartNewConversation}
				/>
			)}
		</div>
	);
}
