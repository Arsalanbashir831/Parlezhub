"use client";

import React from "react";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface HistoryFiltersProps {
	searchQuery: string;
	selectedLanguage: string;
	sortBy: string;
	onSearchChange: (value: string) => void;
	onLanguageChange: (value: string) => void;
	onSortChange: (value: string) => void;
	availableLanguages: string[];
}

export const HistoryFilters = React.memo<HistoryFiltersProps>(
	({
		searchQuery,
		selectedLanguage,
		sortBy,
		onSearchChange,
		onLanguageChange,
		onSortChange,
		availableLanguages,
	}) => {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="flex flex-col md:flex-row gap-4">
						<div className="flex-1 relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
							<Input
								placeholder="Search conversations..."
								value={searchQuery}
								onChange={(e) => onSearchChange(e.target.value)}
								className="pl-10"
							/>
						</div>
						<Select value={selectedLanguage} onValueChange={onLanguageChange}>
							<SelectTrigger className="w-full md:w-48">
								<SelectValue placeholder="All languages" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All languages</SelectItem>
								{availableLanguages.map((language) => (
									<SelectItem key={language} value={language}>
										{language}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select value={sortBy} onValueChange={onSortChange}>
							<SelectTrigger className="w-full md:w-48">
								<SelectValue placeholder="Sort by" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="date">Most Recent</SelectItem>
								<SelectItem value="score">Highest Score</SelectItem>
								<SelectItem value="duration">Longest Duration</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>
		);
	}
);

HistoryFilters.displayName = "HistoryFilters";
