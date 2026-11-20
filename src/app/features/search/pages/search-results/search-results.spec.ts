import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SearchResults } from './search-results';

describe('SearchResults', () => {
  let component: SearchResults;
  let fixture: ComponentFixture<SearchResults>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchResults], providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(SearchResults);
    component = fixture.componentInstance;
  });

  afterEach(() => http.verify());

  it('should create', () => expect(component).toBeTruthy());

  it('sends every search criterion and stores pagination metadata', () => {
    component.city = 'Tunis'; component.budgetMin = 300; component.budgetMax = 700; component.type = 'STUDIO'; component.sort = 'price_asc';
    component.search();
    const request = http.expectOne(r => r.url === '/api/listings/search');
    expect(request.request.params.get('city')).toBe('Tunis');
    expect(request.request.params.get('budgetMin')).toBe('300');
    expect(request.request.params.get('budgetMax')).toBe('700');
    expect(request.request.params.get('type')).toBe('STUDIO');
    expect(request.request.params.get('sort')).toBe('price_asc');
    expect(request.request.params.get('page')).toBe('0');
    request.flush({ content: [], totalElements: 31, totalPages: 2, page: 0, size: 30 });
    expect(component.total).toBe(31);
    expect(component.totalPages).toBe(2);
  });

  it('loads the requested next page with the same criteria', () => {
    component.city = 'Sousse'; component.totalPages = 2;
    component.changePage(1);
    const request = http.expectOne(r => r.url === '/api/listings/search');
    expect(request.request.params.get('page')).toBe('1');
    expect(request.request.params.get('city')).toBe('Sousse');
    request.flush({ content: [], totalElements: 31, totalPages: 2, page: 1, size: 30 });
    expect(component.page).toBe(1);
  });
});
