import { UNIT_GROUPS } from "@/lib/units";

interface UnitSelectProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  id?: string;
}

export default function UnitSelect({
  name,
  value,
  onChange,
  className = "",
  id,
}: UnitSelectProps) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    >
      {UNIT_GROUPS.map((group) => (
        <optgroup key={group.group} label={`── ${group.group} ──`}>
          {group.units.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
