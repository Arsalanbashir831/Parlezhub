"use client";

import React, { memo } from "react";

interface SettingsHeaderProps {
	title: string;
	description: string;
}

const SettingsHeader = memo(({ title, description }: SettingsHeaderProps) => {
	return (
		<div>
			<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
				{title}
			</h1>
			<p className="text-gray-600 dark:text-gray-400 mt-2">{description}</p>
		</div>
	);
});

SettingsHeader.displayName = "SettingsHeader";

export default SettingsHeader;
