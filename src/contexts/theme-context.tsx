"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
interface ThemeContextType {
	theme: Theme;
	toggleTheme: () => void;
	setTheme: (theme: Theme) => void;
	mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setThemeState] = useState<Theme>("light");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		const saved = localStorage.getItem("theme") as Theme | null;
		if (saved) {
			setThemeState(saved);
		} else {
			// const sys = window.matchMedia("(prefers-color-scheme: dark)").matches
			// 	? "dark"
			// 	: "light";
			// setThemeState(sys);
			setThemeState("light"); // Default to light theme
		}
	}, []);

	useEffect(() => {
		if (!mounted) return;
		const root = document.documentElement;
		root.classList.remove("light", "dark");
		root.classList.add(theme);
		localStorage.setItem("theme", theme);
	}, [theme, mounted]);

	const toggleTheme = () =>
		setThemeState((t) => (t === "light" ? "dark" : "light"));
	const setTheme = (t: Theme) => setThemeState(t);

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme, setTheme, mounted }}>
			{/* hide flash but keep context */}
			<div className={mounted ? "" : "opacity-0"}>{children}</div>
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
	return ctx;
}
