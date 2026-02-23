"use client";

import { toBEYear, toCEYear, THAI_MONTHS } from "@/lib/thai-date";

interface ThaiDatePickerProps {
  value: string; // ISO format YYYY-MM-DD (CE)
  onChange: (isoDate: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

export default function ThaiDatePicker({ value, onChange, label, required, className }: ThaiDatePickerProps) {
  const parsed = value ? new Date(value + "T00:00:00") : null;
  const selDay = parsed ? parsed.getDate() : 0;
  const selMonth = parsed ? parsed.getMonth() + 1 : 0;
  const selBEYear = parsed ? toBEYear(parsed.getFullYear()) : 0;

  const currentBE = toBEYear(new Date().getFullYear());
  const years: number[] = [];
  for (let y = currentBE + 1; y >= currentBE - 100; y--) years.push(y);

  const daysInMonth = (month: number, beYear: number) => {
    if (!month || !beYear) return 31;
    return new Date(toCEYear(beYear), month, 0).getDate();
  };

  const days = Array.from({ length: daysInMonth(selMonth, selBEYear) }, (_, i) => i + 1);

  const handleChange = (day: number, month: number, beYear: number) => {
    if (!day || !month || !beYear) { onChange(""); return; }
    const ceYear = toCEYear(beYear);
    const iso = `${ceYear}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(iso);
  };

  const selectCls = `rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${className || ""}`;

  return (
    <div>
      {label && (
        <label className="mb-1 block text-sm font-medium dark:text-gray-300">
          {label}{required && " *"}
        </label>
      )}
      <div className="flex gap-1.5">
        {/* Day */}
        <select
          value={selDay || ""}
          onChange={(e) => handleChange(Number(e.target.value), selMonth, selBEYear)}
          className={selectCls + " w-16"}
        >
          <option value="">วัน</option>
          {days.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        {/* Month */}
        <select
          value={selMonth || ""}
          onChange={(e) => handleChange(selDay, Number(e.target.value), selBEYear)}
          className={selectCls + " flex-1"}
        >
          <option value="">เดือน</option>
          {THAI_MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
        </select>

        {/* BE Year */}
        <select
          value={selBEYear || ""}
          onChange={(e) => handleChange(selDay, selMonth, Number(e.target.value))}
          className={selectCls + " w-24"}
        >
          <option value="">พ.ศ.</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </div>
  );
}
