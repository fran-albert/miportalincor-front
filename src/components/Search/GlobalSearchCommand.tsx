import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useGlobalSearch } from '@/hooks/Search/useGlobalSearch';
import { SearchResult } from '@/api/Search/search-service.interface';
import { User, Users, Loader2 } from 'lucide-react';
import { slugify } from '@/common/helpers/helpers';

interface GlobalSearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearchCommand({
  open,
  onOpenChange,
}: GlobalSearchCommandProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  const { doctors, patients, isLoading, isFetching } =
    useGlobalSearch(searchTerm);

  React.useEffect(() => {
    console.log('GlobalSearchCommand - Search results:', { searchTerm, doctors, patients, isLoading, isFetching });
  }, [doctors, patients, searchTerm, isLoading, isFetching]);

  const handleSelect = (result: SearchResult) => {
    const slug = slugify(`${result.firstName} ${result.lastName}`, parseInt(result.userId));
    if (result.type === 'doctor') {
      navigate(`/medicos/${slug}`);
    } else {
      navigate(`/pacientes/${slug}`);
    }
    onOpenChange(false);
    setSearchTerm('');
  };

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-yellow-200 font-semibold">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
      </span>
    );
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Buscar pacientes y médicos (nombre, DNI, email)..."
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <CommandList>
        {/* Show empty state if no search term */}
        {searchTerm.trim() === '' && !isFetching && (
          <CommandEmpty>
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground">
                Ingresa un término de búsqueda
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Puedes buscar por nombre, apellido, DNI o email
              </p>
            </div>
          </CommandEmpty>
        )}

        {/* Show loading state if fetching and no results yet */}
        {isFetching && doctors.length === 0 && patients.length === 0 && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="ml-2 text-sm text-muted-foreground">
              Buscando...
            </span>
          </div>
        )}

        {/* Show no results message */}
        {!isFetching && searchTerm.trim() && doctors.length === 0 && patients.length === 0 && (
          <CommandEmpty>
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground">
                No se encontraron resultados para "{searchTerm}"
              </p>
            </div>
          </CommandEmpty>
        )}

        {/* Show doctors results */}
        {doctors.length > 0 && (
          <CommandGroup heading="Médicos" className="overflow-hidden">
            {doctors.map((doctor) => (
              <CommandItem
                key={`doctor-${doctor.id}`}
                value={`doctor-${doctor.id}-${doctor.firstName} ${doctor.lastName} ${doctor.userName}`}
                onSelect={() => handleSelect(doctor)}
                className="cursor-pointer hover:bg-greenPrimary/10 aria-selected:bg-greenPrimary/20 transition-colors duration-200"
              >
                <User className="mr-2 h-4 w-4 flex-shrink-0" />
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="font-medium">
                    {highlightMatch(
                      `${doctor.firstName} ${doctor.lastName}`,
                      searchTerm,
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {doctor.userName}
                    {doctor.email && ` • ${doctor.email}`}
                  </div>
                  {doctor.specialities && doctor.specialities.length > 0 && (
                    <div className="text-xs text-muted-foreground truncate">
                      {doctor.specialities.map((s) => s.name).join(', ')}
                    </div>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Show patients results */}
        {patients.length > 0 && (
          <CommandGroup heading="Pacientes" className="overflow-hidden">
            {patients.map((patient) => (
              <CommandItem
                key={`patient-${patient.id}`}
                value={`patient-${patient.id}-${patient.firstName} ${patient.lastName} ${patient.userName}`}
                onSelect={() => handleSelect(patient)}
                className="cursor-pointer hover:bg-greenPrimary/10 aria-selected:bg-greenPrimary/20 transition-colors duration-200"
              >
                <Users className="mr-2 h-4 w-4 flex-shrink-0" />
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="font-medium">
                    {highlightMatch(
                      `${patient.firstName} ${patient.lastName}`,
                      searchTerm,
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {patient.userName}
                    {patient.email && ` • ${patient.email}`}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Show loading indicator in footer when fetching */}
        {isFetching && (doctors.length > 0 || patients.length > 0) && (
          <div className="border-t px-2 py-2 text-xs text-muted-foreground text-center">
            <Loader2 className="h-3 w-3 inline animate-spin mr-1" />
            Actualizando...
          </div>
        )}
        </CommandList>

        <div className="border-t px-2 py-2 text-xs text-muted-foreground">
          <p className="text-center">
            Presiona <kbd className="rounded bg-muted px-1 py-0.5">Ctrl+K</kbd> (o{' '}
            <kbd className="rounded bg-muted px-1 py-0.5">Cmd+K</kbd> en Mac)
          </p>
        </div>
      </Command>
    </CommandDialog>
  );
}
