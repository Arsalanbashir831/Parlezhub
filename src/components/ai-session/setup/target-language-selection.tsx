"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useSession } from "@/contexts/session-context";
import { LANGUAGES } from "@/constants/ai-session";

export default function TargetLanguageSelection() {
	const { config, updateConfig } = useSession();
	const [searchQuery, setSearchQuery] = useState("");

	// Filter languages based on search query
	const filteredLanguages = useMemo(() => {
		if (!searchQuery.trim()) {
			return LANGUAGES;
		}

		return LANGUAGES.filter((language) =>
			language.label.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}, [searchQuery]);

	return (
		<div className="space-y-6">
			<div className="text-center">
				<h2 className="text-2xl font-bold mb-2">Language to Learn</h2>
				<p className="text-gray-600 dark:text-gray-400">
					Which language would you like to practice today?
				</p>
			</div>

			{/* Search Bar */}
			<div className="max-w-md mx-auto">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
					<Input
						type="text"
						placeholder="Search languages..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10 pr-4 py-2 w-full"
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{filteredLanguages.length > 0 ? (
					filteredLanguages.map((language) => (
						<Card
							key={language.value}
							className={`cursor-pointer transition-all hover:shadow-md ${
								config.language === language.value
									? "ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20"
									: ""
							}`}
							onClick={() => updateConfig("language", language.value)}>
							<CardContent className="p-6 text-center">
								<div className="text-4xl mb-2">{language.flag}</div>
								<h3 className="font-semibold">{language.label}</h3>
							</CardContent>
						</Card>
					))
				) : (
					<div className="col-span-full text-center py-8">
						<p className="text-gray-500 dark:text-gray-400">
							No languages found matching "{searchQuery}"
						</p>
					</div>
				)}
			</div>
		</div>
	);
} 