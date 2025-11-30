import {
  ISearchService,
  PaginatedSearchResponse,
  SearchResult,
  GlobalSearchResponse,
} from './search-service.interface';
import { apiIncorHC } from '@/services/axiosConfig';

interface DoctorResponse {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  userName: string;
  email?: string;
  photo?: string;
  matricula?: string;
  specialities?: Array<{ specialityId: string; specialityName: string }>;
}

interface PatientResponse {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  userName: string;
  email?: string;
  photo?: string;
  cuil?: string;
  healthPlans?: Array<{ id: string; name: string }>;
}

interface ApiPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class IncorHCSearchService implements ISearchService {
  async searchDoctors(
    search?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedSearchResponse> {
    try {
      const response = await apiIncorHC.get<ApiPaginatedResponse<DoctorResponse>>(
        '/doctor/search',
        {
          params: {
            search,
            page,
            limit,
          },
        },
      );

      const doctors: SearchResult[] = response.data.data.map((doctor) => ({
        id: doctor.id,
        userId: doctor.userId,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        userName: doctor.userName,
        email: doctor.email,
        photo: doctor.photo,
        type: 'doctor' as const,
        matricula: doctor.matricula,
        specialities: doctor.specialities?.map((s) => ({
          id: s.specialityId,
          name: s.specialityName,
        })),
      }));

      return {
        data: doctors,
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: response.data.totalPages,
        hasNextPage: response.data.hasNextPage,
        hasPreviousPage: response.data.hasPreviousPage,
      };
    } catch (error) {
      console.error('Error searching doctors:', error);
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    }
  }

  async searchPatients(
    search?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedSearchResponse> {
    try {
      const response = await apiIncorHC.get<
        ApiPaginatedResponse<PatientResponse>
      >('/patient/search', {
        params: {
          search,
          page,
          limit,
        },
      });

      const patients: SearchResult[] = response.data.data.map((patient) => ({
        id: patient.id,
        userId: patient.userId,
        firstName: patient.firstName,
        lastName: patient.lastName,
        userName: patient.userName,
        email: patient.email,
        photo: patient.photo,
        type: 'patient' as const,
        cuil: patient.cuil,
        healthPlans: patient.healthPlans?.map((h) => ({
          id: h.id,
          name: h.name,
        })),
      }));

      return {
        data: patients,
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: response.data.totalPages,
        hasNextPage: response.data.hasNextPage,
        hasPreviousPage: response.data.hasPreviousPage,
      };
    } catch (error) {
      console.error('Error searching patients:', error);
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    }
  }

  async searchAll(
    search?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<GlobalSearchResponse> {
    const [doctors, patients] = await Promise.all([
      this.searchDoctors(search, page, limit),
      this.searchPatients(search, page, limit),
    ]);

    return {
      doctors,
      patients,
    };
  }
}
