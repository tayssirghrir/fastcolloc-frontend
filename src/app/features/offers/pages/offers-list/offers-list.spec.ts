import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OffersList } from './offers-list';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { Offer } from '../../services/offer';
import { vi } from 'vitest';

describe('OffersList', () => {
  let component: OffersList;
  let fixture: ComponentFixture<OffersList>;
  let http: HttpTestingController;

  beforeEach(async () => {
    vi.stubGlobal('location', { pathname: '/my-listings' });
    await TestBed.configureTestingModule({
      imports: [OffersList], providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(OffersList);
    component = fixture.componentInstance;
    fixture.detectChanges();
    http.expectOne('/api/listings/mine').flush([]);
    await fixture.whenStable();
  });

  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the connected user’s listings', () => {
    component.isMine = true;
    component.load();

    const request = http.expectOne('/api/listings/mine');
    expect(request.request.method).toBe('GET');
    request.flush([offer()]);
    expect(component.offers).toHaveLength(1);
    expect(component.total).toBe(1);
  });

  it('archives an active listing and reloads the owner list', () => {
    component.isMine = true;
    component.updateStatus(offer());

    const update = http.expectOne('/api/listings/8/status');
    expect(update.request.method).toBe('PATCH');
    expect(update.request.body).toEqual({ status: 'ARCHIVED' });
    update.flush({ ...offer(), status: 'ARCHIVED' });
    http.expectOne('/api/listings/mine').flush([]);
    expect(component.loading).toBe(false);
  });

  it('reactivates an archived listing and reloads the owner list', () => {
    component.isMine = true;
    component.updateStatus({ ...offer(), status: 'ARCHIVED' });
    const update = http.expectOne('/api/listings/8/status');
    expect(update.request.body).toEqual({ status: 'ACTIVE' });
    update.flush({ ...offer(), status: 'ACTIVE' });
    http.expectOne('/api/listings/mine').flush([]);
  });

  it('asks before deleting and reloads after confirmation', () => {
    component.isMine = true;
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    component.delete(offer());

    const request = http.expectOne('/api/listings/8');
    expect(request.request.method).toBe('DELETE');
    request.flush(null, { status: 204, statusText: 'No Content' });
    http.expectOne('/api/listings/mine').flush([]);
    expect(component.loading).toBe(false);
  });

  it('does not delete when confirmation is declined', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    component.delete(offer());
    http.expectNone('/api/listings/8');
  });

  function offer(): Offer {
    return { id: 8, title: 'Chambre à Tunis', type: 'CHAMBRE', city: 'Tunis', price: 450,
      status: 'ACTIVE', score: null, photosCount: 0 };
  }
});
