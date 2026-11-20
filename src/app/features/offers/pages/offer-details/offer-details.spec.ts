import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OfferDetails } from './offer-details';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';

describe('OfferDetails', () => {
  let component: OfferDetails;
  let fixture: ComponentFixture<OfferDetails>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfferDetails], providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '42' } } } }],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(OfferDetails);
    component = fixture.componentInstance;
  });

  afterEach(() => http.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the protected listing detail by route id', () => {
    component.ngOnInit();
    const request = http.expectOne('/api/listings/42');
    expect(request.request.method).toBe('GET');
    request.flush({ id: 42, title: 'Studio', city: 'Tunis', type: 'STUDIO', price: 500,
      status: 'ACTIVE', score: 80, owner: { id: 9, firstName: 'Amel', lastName: 'Ben Ali' } });
    expect(component.offer?.id).toBe(42);
    expect(component.loading).toBe(false);
  });
});
