"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SimpleDateRange {
  from: string | undefined; // "yyyy-MM-dd"
  to: string | undefined;
}

interface DatePickerWithRangeProps {
  value: SimpleDateRange | undefined;
  onChange: (value: SimpleDateRange | undefined) => void;
  className?: string;
  /** Show compact "dd to dd" label instead of full dates */
  compactLabel?: boolean;
  /** Default to month-start instead of 29 days ago */
  defaultToMonthStart?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function monthStart(value: string): string {
  const [y, m] = value.split("-");
  return `${y}-${m}-01`;
}

function shiftMonth(value: string, months: number): string {
  const [y, m] = value.split("-").map(Number);
  const d = new Date(y, m - 1 + months, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function monthTitle(value: string): string {
  const [y, m] = value.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function monthDays(month: string): string[] {
  const [y, m] = month.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const blanks = first.getDay(); // 0 = Sun
  const maxDay = new Date(y, m, 0).getDate();
  const dates: string[] = Array(blanks).fill("");
  for (let i = 1; i <= maxDay; i++) {
    dates.push(`${y}-${String(m).padStart(2, "0")}-${String(i).padStart(2, "0")}`);
  }
  while (dates.length % 7 !== 0) dates.push("");
  return dates;
}

function normalizedRange(from: string, to: string): [string, string] {
  return from <= to ? [from, to] : [to, from];
}

function selectRangeDate(from: string, to: string, selected: string): [string, string] {
  if (!from || !to) return [selected, selected];
  const [start, end] = normalizedRange(from, to);
  if (start === end) return normalizedRange(start, selected);
  if (selected === start) return [start, start];
  if (selected === end) return [end, end];
  if (selected < start) return [selected, end];
  if (selected > end) return [start, selected];
  return [start, selected];
}

function displayDateFull(value: string): string {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function displayDay(value: string): string {
  return String(Number(value.slice(-2)));
}

function dayRangeLabel(from: string, to: string): string {
  const [s, e] = normalizedRange(from, to);
  return `${displayDay(s)} to ${displayDay(e)}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const PRIMARY = "#159FD3";
const PRIMARY_ALPHA_14 = "rgba(21,159,211,0.14)";
const PRIMARY_ALPHA_85 = "rgba(21,159,211,0.85)";

function CalendarSVG({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <rect x="1" y="2" width="16" height="15" rx="2.5" stroke="#64748b" strokeWidth="1.5" />
      <line x1="4" y1="0" x2="4" y2="4" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="0" x2="14" y2="4" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="1" y1="7" x2="17" y2="7" stroke="#64748b" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function ChevronSVG({ left }: { left: boolean }) {
  const x1 = left ? 11 : 7;
  const x2 = left ? 7 : 11;
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <polyline
        points={`${x1},4 ${x2},9 ${x1},14`}
        stroke="#475569"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

interface MonthCalendarProps {
  month: string;
  selectedFrom: string;
  selectedTo: string;
  onSelect: (date: string) => void;
}

function MonthCalendar({ month, selectedFrom, selectedTo, onSelect }: MonthCalendarProps) {
  const days = monthDays(month);
  const [start, end] = normalizedRange(selectedFrom, selectedTo);

  return (
    <div className="flex flex-col gap-1.5">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 px-1 pb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-center text-[11px] font-medium text-slate-400">
            {d}
          </div>
        ))}
      </div>

      {/* Day rows */}
      {days.reduce<string[][]>((acc, _, i) => {
        if (i % 7 === 0) acc.push(days.slice(i, i + 7));
        return acc;
      }, []).map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 px-1">
          {week.map((date, di) => {
            if (!date) return <div key={di} className="h-8" />;

            const isSelected = date === start || date === end;
            const isInRange = date > start && date < end;
            const isStart = date === start && start !== end;
            const isEnd = date === end && start !== end;

            return (
              <div
                key={date}
                className="relative flex h-8 cursor-pointer items-center justify-center"
                onClick={() => onSelect(date)}
              >
                {/* Range background strip */}
                {isInRange && (
                  <div className="absolute inset-y-0 inset-x-0" style={{ background: PRIMARY_ALPHA_14 }} />
                )}
                {isStart && (
                  <div className="absolute inset-y-0 right-0 w-1/2" style={{ background: PRIMARY_ALPHA_14 }} />
                )}
                {isEnd && (
                  <div className="absolute inset-y-0 left-0 w-1/2" style={{ background: PRIMARY_ALPHA_14 }} />
                )}

                {/* Day circle */}
                <div
                  className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-medium transition-colors hover:bg-slate-100"
                  style={
                    isSelected
                      ? { background: PRIMARY_ALPHA_85, color: "#fff" }
                      : { color: "#334155" }
                  }
                >
                  {Number(date.slice(-2))}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DatePickerWithRange({
  value,
  onChange,
  className,
  compactLabel = false,
  defaultToMonthStart = false,
}: DatePickerWithRangeProps) {
  const effectiveFrom = value?.from ?? (defaultToMonthStart ? monthStart(todayDate()) : daysAgo(29));
  const effectiveTo = value?.to ?? todayDate();

  const [isOpen, setIsOpen] = React.useState(false);
  const [visibleMonth, setVisibleMonth] = React.useState(() => monthStart(effectiveFrom));
  const [pendingFrom, setPendingFrom] = React.useState(effectiveFrom);
  const [pendingTo, setPendingTo] = React.useState(effectiveTo);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Click-outside close
  React.useEffect(() => {
    if (!isOpen) return;
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  function openPicker() {
    setPendingFrom(effectiveFrom);
    setPendingTo(effectiveTo);
    setVisibleMonth(monthStart(effectiveFrom));
    setIsOpen(true);
  }

  function handleSelect(date: string) {
    const [nf, nt] = selectRangeDate(pendingFrom, pendingTo, date);
    setPendingFrom(nf);
    setPendingTo(nt);
  }

  function handleApply() {
    const [s, e] = normalizedRange(pendingFrom, pendingTo);
    onChange({ from: s, to: e });
    setIsOpen(false);
  }

  function handleReset() {
    const rf = defaultToMonthStart ? monthStart(todayDate()) : daysAgo(29);
    onChange({ from: rf, to: todayDate() });
    setIsOpen(false);
  }

  const pillLabel = compactLabel
    ? dayRangeLabel(effectiveFrom, effectiveTo)
    : `${displayDateFull(effectiveFrom)} – ${displayDateFull(effectiveTo)}`;

  const nextMonth = shiftMonth(visibleMonth, 1);

  return (
    <div ref={containerRef} className={cn("relative shrink-0", className)}>
      {/* ── Pill Trigger ── */}
      <button
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : openPicker())}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all duration-200",
          "border-white/40 bg-white/20 text-foreground backdrop-blur-md shadow-sm hover:bg-white/35 focus:outline-none",
          isOpen && "border-[#159FD3]/50 ring-2 ring-[#159FD3]/20"
        )}
      >
        <CalendarSVG size={16} />
        <span className="truncate text-sm">{pillLabel}</span>
      </button>

      {/* ── Dropdown ── */}
      {isOpen && (
        <div
          className={cn(
            "absolute right-0 top-full z-[9999] mt-2 rounded-xl border border-slate-200 bg-white p-4 shadow-xl",
            "w-[288px] md:w-[600px]"
          )}
        >
          {/* ── Desktop: two-month header row ── */}
          <div className="hidden md:flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setVisibleMonth((m) => shiftMonth(m, -1))}
              className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-slate-100 transition-colors"
            >
              <ChevronSVG left={true} />
            </button>
            <div className="flex flex-1 items-center justify-around">
              <span className="text-sm font-semibold text-slate-700">
                {monthTitle(visibleMonth)}
              </span>
              <span className="text-sm font-semibold text-slate-700">
                {monthTitle(nextMonth)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setVisibleMonth((m) => shiftMonth(m, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-slate-100 transition-colors"
            >
              <ChevronSVG left={false} />
            </button>
          </div>

          {/* ── Desktop: two month calendars ── */}
          <div className="hidden md:grid grid-cols-2 gap-4">
            <MonthCalendar
              month={visibleMonth}
              selectedFrom={pendingFrom}
              selectedTo={pendingTo}
              onSelect={handleSelect}
            />
            <MonthCalendar
              month={nextMonth}
              selectedFrom={pendingFrom}
              selectedTo={pendingTo}
              onSelect={handleSelect}
            />
          </div>

          {/* ── Mobile: single month ── */}
          <div className="md:hidden">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setVisibleMonth((m) => shiftMonth(m, -1))}
                className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-slate-100 transition-colors"
              >
                <ChevronSVG left={true} />
              </button>
              <span className="text-sm font-semibold text-slate-700">
                {monthTitle(visibleMonth)}
              </span>
              <button
                type="button"
                onClick={() => setVisibleMonth((m) => shiftMonth(m, 1))}
                className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-slate-100 transition-colors"
              >
                <ChevronSVG left={false} />
              </button>
            </div>
            <MonthCalendar
              month={visibleMonth}
              selectedFrom={pendingFrom}
              selectedTo={pendingTo}
              onSelect={handleSelect}
            />
          </div>

          {/* ── Footer ── */}
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="rounded-md px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: PRIMARY }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
