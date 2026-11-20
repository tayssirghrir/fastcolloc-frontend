import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Offer, OfferService } from '../../../offers/services/offer';
import { AuthService } from '../../../../core/services/auth';

@Component({
  imports: [CommonModule, FormsModule, RouterLink],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private offers = inject(OfferService);
  private auth = inject(AuthService);
  city = '';
  budgetMax = 600;
  latest: Offer[] = [];
  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) return;
    this.offers.search({ sort: 'recent', page: 0, size: 5 }).subscribe({ next: page => this.latest = page.content, error: () => this.latest = [] });
  }
}
