import { ISearchService } from './search-service.interface';
import { IncorHCSearchService } from './incor-hc-search.service';

/**
 * Factory para obtener la implementación del servicio de búsqueda
 */
export class SearchServiceFactory {
  private static instance: ISearchService;

  static getInstance(): ISearchService {
    if (!SearchServiceFactory.instance) {
      SearchServiceFactory.instance = new IncorHCSearchService();
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
