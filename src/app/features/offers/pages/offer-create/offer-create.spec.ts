import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { OfferCreate } from './offer-create';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';

@Component({ standalone: true, template: '' })
class MyListingsRouteStub {}

describe('OfferCreate', () => {
  let component: OfferCreate;
  let fixture: ComponentFixture<OfferCreate>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfferCreate], providers: [
        provideRouter([{ path: 'my-listings', component: MyListingsRouteStub }]),
        provideHttpClient(), provideHttpClientTesting()
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OfferCreate);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('blocks submission when required fields are missing', () => {
    component.save();

    expect(component.form.touched).toBe(true);
    expect(component.error).toContain('Verifiez');
    http.expectNone('/api/listings');
  });

  it('posts a valid listing with trimmed text fields', () => {
    component.form.patchValue({ title: '  Chambre claire  ', city: ' Tunis ', price: 450 });

    component.save();

    const request = http.expectOne('/api/listings');
    expect(request.request.method).toBe('POST');
    expect(request.request.body.title).toBe('Chambre claire');
    expect(request.request.body.city).toBe('Tunis');
    expect(request.request.body.price).toBe(450);
    request.flush({ id: 77 });
    expect(component.saving).toBe(false);
  });

  it('updates an existing listing and preserves the returned id', () => {
    component.id = 88;
    component.form.patchValue({ title: '  Studio modifie  ', city: ' Sousse ', price: 600 });

    component.save();

    const request = http.expectOne('/api/listings/88');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body.title).toBe('Studio modifie');
    expect(request.request.body.city).toBe('Sousse');
    request.flush({ id: 88 });
    expect(component.saving).toBe(false);
  });
});
