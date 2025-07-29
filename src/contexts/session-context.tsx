"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { SessionConfig } from "@/types/ai-session";
import { DEFAULT_SESSION_CONFIG } from "@/constants/ai-session";
import { loadSessionConfig } from "@/lib/ai-session-utils";

interface SessionContextType {
	config: SessionConfig;
	updateConfig: (key: keyof SessionConfig, value: string) => void;
	setConfig: (config: SessionConfig) => void;
	resetConfig: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
	children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
	const [config, setConfigState] = useState<SessionConfig>(
		DEFAULT_SESSION_CONFIG
	);

	// Load saved session config on mount
	useEffect(() => {
		const savedConfig = loadSessionConfig();
		if (savedConfig) {
			setConfigState(savedConfig);
		}
	}, []);

	const updateConfig = (key: keyof SessionConfig, value: string) => {
		setConfigState((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const setConfig = (newConfig: SessionConfig) => {
		setConfigState(newConfig);
	};

	const resetConfig = () => {
		setConfigState(DEFAULT_SESSION_CONFIG);
	};

	return (
		<SessionContext.Provider
			value={{
				config,
				updateConfig,
				setConfig,
				resetConfig,
			}}>
			{children}
		</SessionContext.Provider>
	);
}

export function useSession() {
	const context = useContext(SessionContext);
	if (context === undefined) {
		throw new Error("useSession must be used within a SessionProvider");
	}
	return context;
}
