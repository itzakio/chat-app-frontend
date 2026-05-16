import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  onSearch: (term: string) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
  autoFocus?: boolean;
  debounceDelay?: number;
  showClearButton?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "filled";
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Search...",
  className = "",
  initialValue = "",
  autoFocus = false,
  debounceDelay = 0,
  showClearButton = true,
  disabled = false,
  size = "md",
  variant = "default",
}) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevValueRef = useRef(inputValue);
  const prevInitialValueRef = useRef(initialValue); // Track previous initialValue
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (initialValue !== prevInitialValueRef.current) {
      prevInitialValueRef.current = initialValue;
      setInputValue(initialValue);
    }
  }, [initialValue]);

  // Handle search trigger (for Enter key or search button)
  const handleSearch = () => {
    if (debounceDelay > 0) {
      return;
    }
    onSearch(inputValue);
  };

  // Debounced search effect
  useEffect(() => {
    if (debounceDelay <= 0) return;

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // If input becomes empty, trigger immediately (no debounce)
    if (inputValue === "") {
      // Only trigger if it changed from non-empty to empty
      if (prevValueRef.current !== "") {
        onSearch("");
        prevValueRef.current = inputValue;
      }
      return;
    }

    // For non-empty values, use debounce
    debounceTimerRef.current = setTimeout(() => {
      // Only trigger if value actually changed
      if (inputValue !== prevValueRef.current) {
        onSearch(inputValue);
        prevValueRef.current = inputValue;
      }
    }, debounceDelay);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputValue, debounceDelay, onSearch]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Clear debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      // Enter key triggers immediately (bypasses debounce)
      onSearch(inputValue);
      prevValueRef.current = inputValue;
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setInputValue("");
    onSearch(""); // Clear triggers immediately
    prevValueRef.current = "";
    inputRef.current?.focus();
  };

  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm pl-8",
    md: "px-4 py-2 text-base pl-10",
    lg: "px-5 py-3 text-lg pl-12",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5 left-3",
    md: "w-4 h-4 left-3.5",
    lg: "w-5 h-5 left-4",
  };

  const clearButtonSizes = {
    sm: "w-5 h-5 right-2",
    md: "w-6 h-6 right-2.5",
    lg: "w-7 h-7 right-3",
  };

  // Variant classes
  const variantClasses = {
    default:
      "bg-white/50 dark:bg-white/10",
    outline:
      "border-2 border-gray-300 dark:border-gray-600 bg-transparent focus:ring-primary/50 focus:border-primary",
    filled:
      "border-transparent bg-gray-100 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-900 focus:ring-primary/50 focus:border-primary",
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Icon Button */}
      <button
        onClick={handleSearch}
        disabled={disabled}
        className={`absolute ${iconSizes[size]} top-1/2 -translate-y-1/2 cursor-pointer hover:opacity-70 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed`}
        type="button"
        aria-label="Search"
      >
        <Search className="w-full h-full text-gray-400 dark:text-gray-500" />
      </button>

      {/* Input Field */}
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        autoFocus={autoFocus}
        className={`
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          rounded-full focus:outline-none focus:ring-2 transition-all duration-200
          w-full
          ${showClearButton && inputValue ? "pr-8" : "pr-4"}
          disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60
          placeholder:text-gray-400 dark:placeholder:text-gray-500
          text-gray-900 dark:text-gray-100
        `}
      />

      {/* Clear Button */}
      {showClearButton && inputValue && (
        <button
          onClick={handleClear}
          className={`absolute ${clearButtonSizes[size]} top-1/2 -translate-y-1/2 cursor-pointer hover:opacity-70 transition-opacity rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center`}
          type="button"
          aria-label="Clear search"
        >
          <X className="w-3/4 h-3/4 text-gray-400 dark:text-gray-500" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;