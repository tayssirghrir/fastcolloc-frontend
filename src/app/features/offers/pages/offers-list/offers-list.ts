import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Offer, OfferService } from '../../services/offer';

@Component({ selector: 'app-offers-list', standalone: true, imports: [CommonModule, FormsModule, RouterLink], templateUrl: './offers-list.html', styleUrl: './offers-list.css' })
export class OffersList implements OnInit {
  private service = inject(OfferService);
  city = ''; budgetMin: number | null = null; budgetMax: number | null = null; type = '';
  offers: Offer[] = []; total = 0; page = 0; totalPages = 0; loading = false; error = '';
  isMine = false;
  ngOnInit(): void { this.isMine = location.pathname.startsWith('/my-listings'); this.load(); }
  load(): void {
    this.loading = true; this.error = '';
    if (this.isMine) {
      this.service.mine().subscribe({ next: offers => { this.offers = offers; this.total = offers.length; this.loading = false; }, error: () => { this.error = 'Impossible de charger vos annonces.'; this.loading = false; } });
      return;
    }
    this.service.search({ city: this.city, budgetMin: this.budgetMin ?? undefined, budgetMax: this.budgetMax ?? undefined, type: this.type, sort: 'recent', page: this.page, size: 12 }).subscribe({
      next: result => { this.offers = result.content; this.total = result.totalElements; this.totalPages = result.totalPages; this.loading = false; },
      error: () => { this.error = 'Les annonces sont momentanément indisponibles. Réessayez dans quelques instants.'; this.loading = false; }
    });
  }
  reset(): void { this.city = ''; this.budgetMin = null; this.budgetMax = null; this.type = ''; this.page = 0; this.load(); }
  changePage(page: number): void { this.page = page; this.load(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  updateStatus(offer: Offer): void {
    const status = offer.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
    this.service.setStatus(offer.id, status).subscribe({ next: () => this.load(), error: () => this.error = 'Le changement de statut a échoué.' });
  }
  delete(offer: Offer): void {
    if (!window.confirm(`Supprimer définitivement « ${offer.title} » ? Cette action est irréversible.`)) return;
    this.service.remove(offer.id).subscribe({ next: () => this.load(), error: () => this.error = 'La suppression a échoué.' });
  }
  trackOffer(_index: number, offer: Offer): number { return offer.id; }
}
