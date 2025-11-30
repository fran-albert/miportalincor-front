export interface SearchResult {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  userName: string; // DNI
  email?: string;
  photo?: string;
  type: 'doctor' | 'patient';
  // Doctor-specific
  matricula?: string;
  specialities?: Array<{ id: string; name: string }>;
  // Patient-specific
  cuil?: string;
  healthPlans?: Array<{ id: string; name: string }>;
}

export interface PaginatedSearchResponse {
  data: SearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GlobalSearchResponse {
  doctors: PaginatedSearchResponse;
  patients: PaginatedSearchResponse;
}

export interface ISearchService {
  searchDoctors(
    search?: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedSearchResponse>;

  searchPatients(
    search?: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedSearchResponse>;

  searchAll(
    search?: string,
    page?: number,
    limit?: number,
  ): Promise<GlobalSearchResponse>;
}
