"use client";

import React from "react";
import { User, Bot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ConversationMessage {
	id: string;
	type: "user" | "ai";
	content: string;
	timestamp: string;
	correction?: string;
	feedback?: string;
}

interface ConversationTranscriptProps {
	messages: ConversationMessage[];
	tutorName: string;
}

export const ConversationTranscript = React.memo<ConversationTranscriptProps>(
	({ messages, tutorName }) => {
		return (
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Conversation Transcript</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4 max-h-96 overflow-y-auto">
						{messages.map((message) => (
							<div
								key={message.id}
								className={`flex gap-3 ${
									message.type === "user" ? "justify-end" : "justify-start"
								}`}>
								{message.type === "ai" && (
									<Avatar className="h-8 w-8 mt-1">
										<AvatarImage src="/placeholder.svg" />
										<AvatarFallback className="bg-primary-100 text-primary-700 text-sm">
											<Bot className="h-4 w-4" />
										</AvatarFallback>
									</Avatar>
								)}
								<div
									className={`max-w-xs lg:max-w-md ${
										message.type === "user" ? "text-right" : ""
									}`}>
									<div
										className={`px-4 py-2 rounded-lg ${
											message.type === "user"
												? "bg-primary-500 text-white"
												: "bg-gray-100 text-gray-900"
										}`}>
										<p className="text-sm">{message.content}</p>
										<p
											className={`text-xs mt-1 ${
												message.type === "user"
													? "text-primary-100"
													: "text-gray-500"
											}`}>
											{new Date(message.timestamp).toLocaleTimeString([], {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</p>
									</div>

									{/* Corrections and feedback for user messages */}
									{message.type === "user" &&
										(message.correction || message.feedback) && (
											<div className="mt-2 space-y-2">
												{message.correction && (
													<div className="text-xs p-2 bg-yellow-50 border border-yellow-200 rounded">
														<span className="font-medium text-yellow-800">
															Suggested:{" "}
														</span>
														<span className="text-yellow-700">
															{message.correction}
														</span>
													</div>
												)}
												{message.feedback && (
													<div className="text-xs p-2 bg-blue-50 border border-blue-200 rounded">
														<span className="font-medium text-blue-800">
															Tip:{" "}
														</span>
														<span className="text-blue-700">
															{message.feedback}
														</span>
													</div>
												)}
											</div>
										)}
								</div>
								{message.type === "user" && (
									<Avatar className="h-8 w-8 mt-1">
										<AvatarFallback className="bg-gray-100 text-gray-700 text-sm">
											<User className="h-4 w-4" />
										</AvatarFallback>
									</Avatar>
								)}
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}
);

ConversationTranscript.displayName = "ConversationTranscript";
