import React from "react";
import { FiSun, FiMoon } from "react-icons/fi";

const ThemeToggleBtn = ({ theme, setTheme }) => {
  const isDark = theme === "dark";

  return (
    <div
      className="relative inline-flex items-center select-none
                 rounded-full bg-white ring-1 ring-black/10
                 dark:bg-white dark:ring-white/10 px-1 py-1 shadow-sm"
      role="tablist"
      aria-label="Theme"
    >
      {/* sliding thumb */}
      <span
        aria-hidden="true"
        className={`absolute left-1 top-1 size-9 rounded-full shadow-md
                    transition-transform duration-300 ease-out will-change-transform
                    ${isDark ? "translate-x-9 bg-black" : "translate-x-0 bg-primary"}`}
      />

      {/* Light */}
      <button
        type="button"
        onClick={() => setTheme("light")}
        role="tab"
        aria-selected={!isDark}
        aria-label="Switch to light mode"
        className="relative z-10 grid size-9 place-items-center rounded-full
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
                   transition-colors duration-300"
        title="Light"
      >
        <FiSun
          className={`h-5 w-5 transition-colors duration-300
                      ${isDark ? "text-gray-600" : "text-white"}`}
        />
      </button>

      {/* Dark */}
      <button
        type="button"
        onClick={() => setTheme("dark")}
        role="tab"
        aria-selected={isDark}
        aria-label="Switch to dark mode"
        className="relative z-10 grid size-9 place-items-center rounded-full
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/60
                   transition-colors duration-300"
        title="Dark"
      >
        <FiMoon
          className={`h-5 w-5 transition-colors duration-300
                      ${isDark ? "text-white" : "text-gray-900"}`}
        />
      </button>
    </div>
  );
};

export default ThemeToggleBtn;
