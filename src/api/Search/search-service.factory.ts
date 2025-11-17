import { ISearchService } from './search-service.interface';
import { IncorHCSearchService } from './incor-hc-search.service';
import { HealthcareApiSearchService } from './healthcare-api-search.service';

/**
 * Factory para obtener la implementación correcta del servicio de búsqueda
 * basada en la configuración de la variable de entorno VITE_USE_INCOR_HC_API
 */
export class SearchServiceFactory {
  private static instance: ISearchService;

  static getInstance(): ISearchService {
    if (!SearchServiceFactory.instance) {
      const useIncorHCApi =
        import.meta.env.VITE_USE_INCOR_HC_API === 'true';

      if (useIncorHCApi) {
        console.log('Using IncorHCSearchService');
        SearchServiceFactory.instance = new IncorHCSearchService();
      } else {
        console.log('Using HealthcareApiSearchService');
        SearchServiceFactory.instance = new HealthcareApiSearchService();
      }
    }
    return SearchServiceFactory.instance;
  }

  /**
   * Método para resetear la instancia (útil para testing)
   */
  static reset(): void {
    SearchServiceFactory.instance = null as any;
  }
}

// Export singleton instance
export const searchService = SearchServiceFactory.getInstance();
