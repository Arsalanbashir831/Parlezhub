"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "../lib/types";

interface AuthContextType {
	user: User | null;
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
	signup: (userData: Partial<User>, password: string) => Promise<void>;
	forgotPassword: (email: string) => Promise<void>;
	resetPassword: (token: string, password: string) => Promise<void>;
	verifyEmail: (token: string) => Promise<void>;
	isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Check for existing session
		const checkAuth = async () => {
			try {
				const token = localStorage.getItem("auth_token");
				if (token) {
					// Validate token and get user data
					// This would be an API call to your backend
					// For now, we'll simulate with localStorage
					const userData = localStorage.getItem("user_data");
					if (userData) {
						setUser(JSON.parse(userData));
					}
				}
			} catch (error) {
				console.error("Auth check failed:", error);
			} finally {
				setIsLoading(false);
			}
		};

		checkAuth();
	}, []);

	const login = async (email: string, password: string) => {
		setIsLoading(true);
		try {
			// API call to backend
			// For demo purposes, we'll simulate
			const mockUser: User = {
				id: "1",
				firstName: "John",
				lastName: "Doe",
				email,
				role: "student",
				city: "New York",
				country: "USA",
				postalCode: "10001",
				address: "123 Main St",
				isVerified: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			localStorage.setItem("auth_token", "mock_token");
			localStorage.setItem("user_data", JSON.stringify(mockUser));
			setUser(mockUser);
		} catch (error) {
			throw new Error("Login failed");
		} finally {
			setIsLoading(false);
		}
	};

	const logout = () => {
		localStorage.removeItem("auth_token");
		localStorage.removeItem("user_data");
		setUser(null);
	};

	const signup = async (userData: Partial<User>, password: string) => {
		setIsLoading(true);
		try {
			// API call to backend
			console.log("Signing up user:", userData);
			// For demo, we'll just log the data
		} catch (error) {
			throw new Error("Signup failed");
		} finally {
			setIsLoading(false);
		}
	};

	const forgotPassword = async (email: string) => {
		// API call to backend
		console.log("Forgot password for:", email);
	};

	const resetPassword = async (token: string, password: string) => {
		// API call to backend
		console.log("Reset password with token:", token);
	};

	const verifyEmail = async (token: string) => {
		// API call to backend
		console.log("Verify email with token:", token);
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				login,
				logout,
				signup,
				forgotPassword,
				resetPassword,
				verifyEmail,
				isLoading,
			}}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
