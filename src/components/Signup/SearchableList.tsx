import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { normalizeForSearch } from "./signup.utils";

export interface SearchableOption {
  id: number;
  label: string;
}

interface SearchableListProps {
  options: SearchableOption[];
  onSelect: (option: SearchableOption) => void;
  placeholder: string;
  emptyText: string;
  inputId: string;
  isLoading?: boolean;
  invalid?: boolean;
  testId?: string;
}

/**
 * Buscador con la lista abierta debajo (no un desplegable): en el celular se
 * ve todo sin tener que adivinar dónde tocar. Nunca acepta texto libre.
 */
export function SearchableList({
  options,
  onSelect,
  placeholder,
  emptyText,
  inputId,
  isLoading = false,
  invalid = false,
  testId,
}: SearchableListProps) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = normalizeForSearch(query);
    if (!needle) return options;
    return options.filter((option) =>
      normalizeForSearch(option.label).includes(needle)
    );
  }, [options, query]);

  return (
    <div className="space-y-2" data-testid={testId}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          id={inputId}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          aria-invalid={invalid}
          className="pl-10 h-12 text-base border-gray-300 focus:border-greenPrimary focus:ring-greenPrimary"
        />
      </div>
      <ul
        className="max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white divide-y divide-slate-100"
        role="listbox"
        aria-label={placeholder}
      >
        {isLoading ? (
          <li className="px-4 py-3 text-sm text-gray-500">Cargando…</li>
        ) : filtered.length === 0 ? (
          <li className="px-4 py-3 text-sm text-gray-500">{emptyText}</li>
        ) : (
          filtered.map((option) => (
            <li key={option.id} role="option" aria-selected={false}>
              <button
                type="button"
                className="w-full text-left px-4 py-3 text-base text-gray-800 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                onClick={() => onSelect(option)}
              >
                {option.label}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
