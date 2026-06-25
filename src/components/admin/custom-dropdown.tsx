"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | DropdownOption)[];
  allowCustom?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export function CustomDropdown({
  allowCustom = false,
  value,
  onChange,
  options,
  disabled = false,
  className,
  placeholder = "Select option...",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [menuPosition, setMenuPosition] = React.useState<{
    bottom?: number;
    left: number;
    maxHeight: number;
    top?: number;
    width: number;
  }>({ left: 0, maxHeight: 240, top: 0, width: 128 });
  const containerRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const customInputRef = React.useRef<HTMLInputElement>(null);

  const normalizedOptions = React.useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === "string") {
        return { value: opt, label: opt };
      }
      return opt;
    });
  }, [options]);

  const selectedOption = React.useMemo(() => {
    return normalizedOptions.find((opt) => opt.value === value) || null;
  }, [normalizedOptions, value]);

  const visibleOptions = React.useMemo(() => {
    if (!allowCustom || !value.trim()) return normalizedOptions;
    const normalizedValue = value.toLowerCase().trim();
    return normalizedOptions.filter((option) =>
      option.label.toLowerCase().includes(normalizedValue) || option.value.toLowerCase().includes(normalizedValue)
    );
  }, [allowCustom, normalizedOptions, value]);

  const updateMenuPosition = React.useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const gap = 6;
    const spaceBelow = window.innerHeight - rect.bottom - gap;
    const spaceAbove = rect.top - gap;
    const openAbove = spaceBelow < 180 && spaceAbove > spaceBelow;
    const availableSpace = Math.max(120, openAbove ? spaceAbove : spaceBelow);

    setMenuPosition({
      bottom: openAbove ? window.innerHeight - rect.top + gap : undefined,
      left: Math.max(8, Math.min(rect.left, window.innerWidth - Math.max(rect.width, 128) - 8)),
      maxHeight: Math.min(240, availableSpace),
      top: openAbove ? undefined : rect.bottom + gap,
      width: Math.max(rect.width, 128),
    });
  }, []);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const inTrigger = containerRef.current?.contains(target);
      const inMenu = menuRef.current?.contains(target);
      if (!inTrigger && !inMenu) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      updateMenuPosition();
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("resize", updateMenuPosition);
      window.addEventListener("scroll", updateMenuPosition, true);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isOpen, updateMenuPosition]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative inline-block w-full text-left", className)}>
      {allowCustom ? (
        <div
          className={cn(
            "flex h-9 w-full items-center justify-between gap-1.5 rounded-lg border border-white/40 bg-white/20 px-2.5 py-1.5 text-sm font-medium text-foreground shadow-sm backdrop-blur-md transition-all duration-200 hover:bg-white/35 focus-within:ring-2 focus-within:ring-[#159FD3]/40",
            isOpen && "border-[#159FD3]/50 ring-2 ring-[#159FD3]/20",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <input
            ref={customInputRef}
            type="text"
            disabled={disabled}
            value={value}
            placeholder={placeholder}
            onChange={(event) => {
              onChange(event.target.value);
              if (!isOpen) {
                updateMenuPosition();
                setIsOpen(true);
              }
            }}
            onFocus={() => {
              updateMenuPosition();
              setIsOpen(true);
            }}
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground/70"
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              customInputRef.current?.focus();
              if (!isOpen) updateMenuPosition();
              setIsOpen((current) => !current);
            }}
            aria-label="Show options"
          >
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
                isOpen && "rotate-180 text-foreground"
              )}
            />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!isOpen) updateMenuPosition();
            setIsOpen((current) => !current);
          }}
          className={cn(
            "flex h-9 w-full items-center justify-between gap-1.5 rounded-lg border border-white/40 bg-white/20 px-2.5 py-1.5 text-sm font-medium text-foreground backdrop-blur-md shadow-sm transition-all duration-200 hover:bg-white/35 focus:outline-none focus:ring-2 focus:ring-[#159FD3]/40 disabled:cursor-not-allowed disabled:opacity-50",
            isOpen && "border-[#159FD3]/50 ring-2 ring-[#159FD3]/20"
          )}
        >
          <span className="truncate capitalize">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 shrink-0",
              isOpen && "rotate-180 text-foreground"
            )}
          />
        </button>
      )}

      {isOpen && typeof document !== "undefined" ? createPortal(
        <div
          ref={menuRef}
          className="fixed z-[9999] min-w-[8rem] origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg animate-in fade-in-0 zoom-in-95 duration-100"
          style={{
            bottom: menuPosition.bottom,
            left: menuPosition.left,
            top: menuPosition.top,
            width: menuPosition.width,
          }}
        >
          <div className="flex flex-col gap-1 overflow-y-auto scrollbar-thin" style={{ maxHeight: menuPosition.maxHeight }}>
            {visibleOptions.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors duration-150 focus:outline-none capitalize",
                    isSelected
                      ? "bg-[#159FD3]/15 font-semibold text-[#0b7fae]"
                      : "text-foreground hover:bg-slate-100 hover:text-foreground"
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-[#159FD3]" />}
                </button>
              );
            })}
            {allowCustom && value.trim() && !normalizedOptions.some((option) => option.value.toLowerCase() === value.toLowerCase().trim()) ? (
              <button
                type="button"
                onClick={() => handleSelect(value.trim())}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#0b7fae] transition-colors duration-150 hover:bg-[#159FD3]/10"
              >
                <span className="truncate">Use {value.trim()}</span>
              </button>
            ) : null}
          </div>
        </div>,
        document.body
      ) : null}
    </div>
  );
}
