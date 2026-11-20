import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Offer, OfferService } from '../../services/offer';
import { AuthService } from '../../../../core/services/auth';
import { Router } from '@angular/router';

@Component({ selector: 'app-offer-details', standalone: true, imports: [CommonModule, RouterLink], templateUrl: './offer-details.html', styleUrl: './offer-details.css' })
export class OfferDetails implements OnInit {
  private route = inject(ActivatedRoute); private offers = inject(OfferService); private auth = inject(AuthService); private router = inject(Router);
  offer: Offer | null = null; loading = true; error = ''; connected = this.auth.isLoggedIn();
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.offers.get(id).subscribe({ next: offer => { this.offer = offer; this.loading = false; }, error: () => { this.error = 'Cette annonce est introuvable ou n’est plus disponible.'; this.loading = false; } });
  }
  contactOwner(): void {
    if (!this.offer?.owner) return;
    this.router.navigate(['/messages'], { queryParams: { listingId: this.offer.id, userId: this.offer.owner.id } });
  }
}
