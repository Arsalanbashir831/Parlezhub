"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useMeetings } from "@/hooks/useMeetings";
import { Search } from "lucide-react";

export default function MeetingFilters() {
	const { searchQuery, setSearchQuery, selectedLanguage, setSelectedLanguage } =
		useMeetings();
	return (
		<Card>
			<CardContent className="p-6">
				<div className="flex flex-col md:flex-row gap-4">
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
						<Input
							placeholder="Search meetings..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>
					<Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
						<SelectTrigger className="w-full md:w-48">
							<SelectValue placeholder="All languages" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All languages</SelectItem>
							<SelectItem value="Spanish">Spanish</SelectItem>
							<SelectItem value="French">French</SelectItem>
							<SelectItem value="German">German</SelectItem>
							<SelectItem value="Italian">Italian</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</CardContent>
		</Card>
	);
}
