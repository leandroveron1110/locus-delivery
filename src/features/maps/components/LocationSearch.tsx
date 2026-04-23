"use client";

import { useState } from "react";

export interface LocationResult {
  lat: number;
  lng: number;
  label: string;
}

export default function LocationSearch({
  placeholder,
  onSelect,
}: {
  placeholder: string;
  onSelect: (r: LocationResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  async function search() {
    if (!query.trim()) return;

    setLoading(true);
        const DEFAULT_CITY = "Concepción del Uruguay";
    const DEFAULT_COUNTRY = "Argentina";
    const fullAddress = `${query}, ${DEFAULT_CITY}, ${DEFAULT_COUNTRY}`;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        fullAddress,
      )}`,
    );
    const data = await res.json();

    if (data[0]) {
      onSelect({
        lat: +data[0].lat,
        lng: +data[0].lon,
        label: data[0].display_name,
      });
      setQuery(data[0].display_name);
    }

    setLoading(false);
  }

  return (
    <div className="flex gap-2">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-3 py-2 rounded-lg border text-sm"
      />
      <button
        onClick={search}
        disabled={loading}
        className="px-4 rounded-lg bg-gray-900 text-white"
      >
        {loading ? "..." : "Buscar"}
      </button>
    </div>
  );
}
