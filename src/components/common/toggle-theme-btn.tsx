import { Button } from "../ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

type Props = {};

export default function ToggleThemeBtn({}: Props) {
	const { theme, toggleTheme } = useTheme();

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={toggleTheme}
			className="hover:bg-gray-100 dark:hover:bg-gray-700">
			{theme === "light" ? (
				<Moon className="h-4 w-4" />
			) : (
				<Sun className="h-4 w-4" />
			)}
		</Button>
	);
}
