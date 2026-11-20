import { AfterViewInit, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import * as L from 'leaflet';
import { Offer, OfferService } from '../../../offers/services/offer';
import { AuthService } from '../../../../core/services/auth';

@Component({ selector: 'app-search-results', standalone: true, imports: [CommonModule, FormsModule, RouterLink], templateUrl: './search-results.html', styleUrl: './search-results.css' })
export class SearchResults implements OnInit, AfterViewInit, OnDestroy {
  private offers = inject(OfferService);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  city = ''; budgetMin: number | null = null; budgetMax = 600; type = ''; sort = 'score'; results: Offer[] = []; total = 0; page = 0; pageSize = 30; totalPages = 0; loading = false; error = ''; alertCreated = false;
  private map?: L.Map;
  private markerLayer?: L.LayerGroup;
  private selectedId: number | null = null;
  alertMessage = '';
  ngOnInit(): void {
    const query = this.route.snapshot.queryParamMap;
    this.city = query.get('city') ?? '';
    this.budgetMax = Number(query.get('budgetMax') ?? 600);
    this.search();
  }
  ngAfterViewInit(): void {
    this.map = L.map('smart-map', { zoomControl: false }).setView([34.1, 9.5], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 }).addTo(this.map);
    L.control.zoom({ position: 'topright' }).addTo(this.map);
    this.markerLayer = L.layerGroup().addTo(this.map);
    this.map.on('moveend', () => this.loadMarkers());
    setTimeout(() => this.map?.invalidateSize(), 100);
    this.loadMarkers();
  }
  ngOnDestroy(): void { this.map?.remove(); }
  reset(): void { this.city = ''; this.budgetMin = null; this.budgetMax = 600; this.type = ''; this.sort = 'score'; this.search(); }
  changePage(page: number): void { if (page < 0 || page >= this.totalPages) return; this.search(page); }
  createAlert(): void {
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } }); return; }
    this.offers.saveSearch({ city: this.city, budgetMin: this.budgetMin ?? undefined, budgetMax: this.budgetMax, type: this.type }).subscribe({ next: () => this.alertMessage = 'Alerte enregistrée dans votre espace.', error: () => this.alertMessage = 'Impossible d’enregistrer cette alerte.' });
  }
  selectOffer(offer: Offer): void {
    this.selectedId = offer.id;
    if (offer.latitude != null && offer.longitude != null) this.map?.setView([offer.latitude, offer.longitude], 14);
  }
  private loadMarkers(): void {
    if (!this.map) return;
    const bounds = this.map.getBounds();
    this.offers.map({
      city: this.city, budgetMin: this.budgetMin ?? undefined, budgetMax: this.budgetMax, type: this.type,
      minLat: bounds.getSouth(), maxLat: bounds.getNorth(), minLng: bounds.getWest(), maxLng: bounds.getEast()
    }).subscribe({
      next: markers => {
        if (!this.markerLayer) return;
        this.markerLayer.clearLayers();
        markers.forEach(marker => {
          if (marker.latitude == null || marker.longitude == null) return;
          const color = marker.score === null ? '#64748b' : marker.score >= 75 ? '#20ae67' : marker.score >= 50 ? '#f58a13' : '#e94d4d';
          const label = marker.score === null ? 'N/A' : `${marker.score}%`;
          const icon = L.divIcon({ className: 'price-marker', html: `<span style="background:${color}">${label}</span>`, iconAnchor: [35, 18] });
          const popup = `<strong>${marker.title}</strong><br>${marker.city} · ${marker.price} TND<br><a href="/offers/${marker.id}">Consulter l’annonce →</a>`;
          L.marker([marker.latitude, marker.longitude], { icon }).bindPopup(popup).addTo(this.markerLayer!);
        });
      }, error: () => this.error = 'La carte n’a pas pu charger les annonces.'
    });
  }
  search(page = 0): void {
    this.page = page;
    this.loading = true; this.error = '';
    this.offers.search({ city: this.city, budgetMin: this.budgetMin ?? undefined, budgetMax: this.budgetMax, type: this.type, sort: this.sort, page, size: this.pageSize }).subscribe({
      next: result => { this.results = result.content; this.total = result.totalElements; this.totalPages = result.totalPages; this.loading = false; this.loadMarkers(); },
      error: () => { this.error = 'Impossible de charger les annonces. Connectez-vous puis réessayez.'; this.loading = false; }
    });
  }
  level(score: number | null): string { return score === null ? '—' : score >= 75 ? 'Très compatible' : score >= 50 ? 'Compatible' : 'Peu compatible'; }
}
