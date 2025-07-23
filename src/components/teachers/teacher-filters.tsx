"use client";

import React from "react";
import { Search, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface TeacherFiltersProps {
	searchQuery: string;
	selectedLanguage: string;
	priceRange: number[];
	showFilters: boolean;
	resultsCount: number;
	availableLanguages: string[];
	onSearchChange: (value: string) => void;
	onLanguageChange: (value: string) => void;
	onPriceRangeChange: (value: number[]) => void;
	onToggleFilters: () => void;
	onClearFilters: () => void;
}

export const TeacherFilters = React.memo<TeacherFiltersProps>(
	({
		searchQuery,
		selectedLanguage,
		priceRange,
		showFilters,
		resultsCount,
		availableLanguages,
		onSearchChange,
		onLanguageChange,
		onPriceRangeChange,
		onToggleFilters,
		onClearFilters,
	}) => {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="space-y-4">
						{/* Search Bar */}
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
							<Input
								placeholder="Search by name, language, or specialty..."
								value={searchQuery}
								onChange={(e) => onSearchChange(e.target.value)}
								className="pl-10"
							/>
						</div>

						{/* Filter Toggle */}
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
							<Button
								variant="outline"
								onClick={onToggleFilters}
								className="gap-2 w-fit">
								<Filter className="h-4 w-4" />
								Filters
							</Button>
							<p className="text-sm text-gray-600">
								{resultsCount} teachers found
							</p>
						</div>

						{/* Filters */}
						{showFilters && (
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
								<div>
									<Label>Language</Label>
									<Select
										value={selectedLanguage}
										onValueChange={onLanguageChange}>
										<SelectTrigger className="mt-1">
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
								</div>

								<div>
									<Label>Price Range ($/hour)</Label>
									<div className="mt-3">
										<Slider
											value={priceRange}
											onValueChange={onPriceRangeChange}
											max={100}
											min={0}
											step={5}
											className="w-full"
										/>
										<div className="flex justify-between text-sm text-gray-600 mt-1">
											<span>${priceRange[0]}</span>
											<span>${priceRange[1]}</span>
										</div>
									</div>
								</div>

								<div className="flex items-end">
									<Button
										variant="outline"
										onClick={onClearFilters}
										className="w-full">
										Clear Filters
									</Button>
								</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		);
	}
);

TeacherFilters.displayName = "TeacherFilters";
