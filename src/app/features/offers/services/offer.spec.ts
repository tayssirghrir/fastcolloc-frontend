import { TestBed } from '@angular/core/testing';
import { OfferService } from './offer';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';

describe('OfferService', () => {
  let service: OfferService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(OfferService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('uses the authenticated search endpoint and forwards filters', () => {
    service.search({ city: 'Tunis', budgetMax: 600, sort: 'score', page: 0, size: 10 }).subscribe();

    const request = http.expectOne(req => req.url === '/api/listings/search');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('city')).toBe('Tunis');
    expect(request.request.params.get('budgetMax')).toBe('600');
    expect(request.request.params.get('sort')).toBe('score');
    request.flush({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 });
  });

  it('forwards the visible map bounds to the authenticated marker endpoint', () => {
    service.map({ minLat: 36, maxLat: 37, minLng: 9, maxLng: 11 }).subscribe();

    const request = http.expectOne(req => req.url === '/api/listings/map');
    expect(request.request.params.get('minLat')).toBe('36');
    expect(request.request.params.get('maxLat')).toBe('37');
    expect(request.request.params.get('minLng')).toBe('9');
    expect(request.request.params.get('maxLng')).toBe('11');
    request.flush([]);
  });
});
