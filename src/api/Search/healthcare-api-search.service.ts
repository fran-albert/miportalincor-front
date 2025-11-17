import {
  ISearchService,
  PaginatedSearchResponse,
  SearchResult,
  GlobalSearchResponse,
} from './search-service.interface';
import { apiIncor } from '@/services/axiosConfig';

interface DoctorData {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  userName: string; // DNI
  email?: string;
  photo?: string;
  matricula?: string;
  specialities?: Array<{ id: string; name: string }>;
}

interface PatientData {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  userName: string; // DNI
  email?: string;
  photo?: string;
  cuil?: string;
  healthPlans?: Array<{ id: string; name: string }>;
}

export class HealthcareApiSearchService implements ISearchService {
  async searchDoctors(
    search?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedSearchResponse> {
    try {
      // Healthcare.Api doesn't have a paginated search endpoint
      // We'll fetch all doctors and filter client-side
      const response = await apiIncor.get<DoctorData[]>('/Doctor/all');

      console.log('Healthcare API Doctor Response:', {
        status: response.status,
        dataLength: response.data?.length,
        firstDoctor: response.data?.[0],
        rawResponse: response.data,
      });

      let filtered = response.data;

      if (search && search.trim()) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(
          (doctor) =>
            doctor.firstName.toLowerCase().includes(searchLower) ||
            doctor.lastName.toLowerCase().includes(searchLower) ||
            doctor.userName.toLowerCase().includes(searchLower) ||
            doctor.email?.toLowerCase().includes(searchLower),
        );
      }

      const total = filtered.length;
      const totalPages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;
      const paginatedData = filtered.slice(skip, skip + limit);

      const doctors: SearchResult[] = paginatedData.map((doctor) => {
        console.log('Processing doctor:', {
          doctorId: doctor.id,
          userId: doctor.userId,
          firstName: doctor.firstName,
          rawDoctor: doctor,
        });
        return {
          id: doctor.id,
          userId: doctor.userId,
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          userName: doctor.userName,
          email: doctor.email,
          photo: doctor.photo,
          type: 'doctor' as const,
          matricula: doctor.matricula,
          specialities: doctor.specialities,
        };
      });

      console.log('Mapped doctors:', { count: doctors.length, doctors });

      return {
        data: doctors,
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
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
      // Healthcare.Api has pagination support for patients
      const response = await apiIncor.get<{
        data: any[];
        totalRecords: number;
        totalPages: number;
        page: number;
        pageSize: number;
      }>('/Patient', {
        params: {
          search,
          page,
          pageSize: limit,
        },
      });

      console.log('Healthcare API Patient Response:', {
        status: response.status,
        totalRecords: response.data.totalRecords,
        dataLength: response.data.data?.length,
        firstPatient: response.data.data?.[0],
      });

      // Extract patient data, handling nested user object
      const patients: SearchResult[] = response.data.data
        .filter((patient: any) => patient) // Filter out null entries
        .map((patient: any) => {
          // Get user info from nested user object
          const user = patient.user || {};

          console.log('Processing patient:', {
            patientId: patient.id,
            hasUser: !!patient.user,
            firstName: user.firstName,
          });

          // Extract health plans, filtering out null values
          const healthPlans = patient.healthPlans
            ?.filter((hp: any) => hp && hp.name) // Filter out null/invalid health plans
            .map((hp: any) => ({
              id: hp.id?.toString() || hp.healthInsuranceId?.toString() || '',
              name: hp.name,
            })) || [];

          const result = {
            id: patient.id?.toString(),
            userId: user.id?.toString(), // Use user.id directly as userId
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            userName: user.userName || '',
            email: user.email || '',
            photo: user.photo || '',
            type: 'patient' as const,
            cuil: patient.cuil || '',
            healthPlans,
          };

          console.log('Mapped patient:', result);
          return result;
        });

      console.log('Mapped Patients:', { count: patients.length, patients });

      return {
        data: patients,
        total: response.data.totalRecords,
        page: response.data.page,
        limit: response.data.pageSize,
        totalPages: response.data.totalPages,
        hasNextPage: page < response.data.totalPages,
        hasPreviousPage: page > 1,
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
