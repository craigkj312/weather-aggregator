import { useState } from "react";

interface LocationSearchProps {
  onSearch: (query: string) => void;
  onUseMyLocation: () => void;
  loading: boolean;
}

export function LocationSearch({
  onSearch,
  onUseMyLocation,
  loading,
}: LocationSearchProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSearch(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search a city (e.g. Tokyo, London, New York)"
        className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />
      <button
        type="submit"
        disabled={loading || !value.trim()}
        className="rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Search
      </button>
      <button
        type="button"
        onClick={onUseMyLocation}
        disabled={loading}
        title="Use my location"
        className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Locate
      </button>
    </form>
  );
}
