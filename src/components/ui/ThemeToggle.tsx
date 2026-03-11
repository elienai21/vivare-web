"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // Evita hydration mismatch
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <div className="w-5 h-5 bg-neutral-200 dark:bg-neutral-700 animate-pulse rounded-full" />
            </button>
        );
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group cursor-pointer"
            aria-label="Alternar tema"
        >
            <Sun className="h-5 w-5 text-neutral-600 dark:text-neutral-400 absolute transition-all scale-100 rotate-0 dark:scale-0 dark:-rotate-90 group-hover:text-primary-500" />
            <Moon className="h-[18px] w-[18px] text-neutral-600 dark:text-neutral-400 absolute transition-all scale-0 rotate-90 dark:scale-100 dark:rotate-0 group-hover:text-primary-400" />
            <span className="sr-only">Toggle theme</span>
        </button>
    );
}
