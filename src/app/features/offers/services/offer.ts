import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Offer {
  id: number; title: string; type: string; city: string; neighborhood?: string;
  price: number; availableFrom?: string; furnished?: boolean; status: string;
  coverUrl?: string; photosCount?: number; score: number | null; level?: string;
  latitude?: number; longitude?: number;
  description?: string; address?: string; roomsCount?: number; roommatesCount?: number; smokersAllowed?: boolean; petsAllowed?: boolean; guestsAllowed?: boolean;
  photos?: Array<{ id: number; url: string; position: number }>;
  owner?: { id: number; firstName: string; lastName: string };
  compatibility?: { score: number; level: string; levelLabel: string; profileComplete: boolean; pointsObtained: number; pointsPossible: number; criteria: Array<{ key: string; label: string; maxPoints: number; points: number; evaluated: boolean; comment: string }> } | null;
  mine?: boolean;
}
export interface OfferPage { content: Offer[]; totalElements: number; totalPages: number; page: number; size: number; }
export interface OfferCriteria {
  city?: string; budgetMax?: number; budgetMin?: number; type?: string; sort?: string; page?: number; size?: number;
  minLat?: number; maxLat?: number; minLng?: number; maxLng?: number;
}

@Injectable({ providedIn: 'root' })
export class OfferService {
  private http = inject(HttpClient);
  private base = '/api/listings';

  search(criteria: OfferCriteria): Observable<OfferPage> {
    let params = new HttpParams();
    Object.entries(criteria).forEach(([key, value]) => { if (value !== undefined && value !== '') params = params.set(key, String(value)); });
    return this.http.get<OfferPage>(`${this.base}/search`, { params });
  }
  get(id: number): Observable<Offer> { return this.http.get<Offer>(`${this.base}/${id}`); }
  create(data: object): Observable<Offer> { return this.http.post<Offer>(this.base, data); }
  update(id: number, data: object): Observable<Offer> { return this.http.put<Offer>(`${this.base}/${id}`, data); }
  addPhotos(id: number, data: FormData): Observable<unknown> { return this.http.post(`${this.base}/${id}/photos`, data); }
  deletePhoto(id: number, photoId: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}/photos/${photoId}`); }
  deletePhotos(id: number, photoId: number): Observable<void> { return this.deletePhoto(id, photoId); }
  setCoverPhoto(id: number, photoId: number): Observable<void> { return this.http.patch<void>(`${this.base}/${id}/photos/${photoId}/cover`, {}); }
  mine(): Observable<Offer[]> { return this.http.get<Offer[]>(`${this.base}/mine`); }
  map(criteria: OfferCriteria): Observable<Offer[]> {
    let params = new HttpParams();
    Object.entries(criteria).forEach(([key, value]) => { if (value !== undefined && value !== '') params = params.set(key, String(value)); });
    return this.http.get<Offer[]>(`${this.base}/map`, { params });
  }
  remove(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
  setStatus(id: number, status: string): Observable<Offer> { return this.http.patch<Offer>(`${this.base}/${id}/status`, { status }); }
  saveSearch(criteria: Pick<OfferCriteria, 'city' | 'budgetMin' | 'budgetMax' | 'type'>): Observable<unknown> { return this.http.post('/api/search-alerts', criteria); }
}
