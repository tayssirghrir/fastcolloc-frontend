import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

interface ProfileData { firstName: string; lastName: string; phone?: string; birthDate?: string; gender?: string; bio?: string; photoUrl?: string; institutionOrWorkplace?: string; preferredCity?: string; budgetMin?: number; budgetMax?: number; smoker: boolean; hasPets: boolean; sleepSchedule?: string; cleanlinessLevel?: number; guestsAllowed: boolean; }

@Component({ selector: 'app-profile', standalone: true, imports: [CommonModule, FormsModule, RouterLink], templateUrl: './profile.html', styleUrl: './profile.css' })
export class Profile implements OnInit {
  private http = inject(HttpClient);
  profile: ProfileData | null = null; loading = true; error = '';
  currentPassword = ''; newPassword = ''; passwordMessage = ''; passwordError = ''; savingPassword = false;
  ngOnInit(): void { this.http.get<ProfileData>('/api/users/me/profile').subscribe({ next: data => { this.profile = data; this.loading = false; }, error: () => { this.error = 'Impossible de charger votre profil.'; this.loading = false; } }); }
  changePassword(): void {
    this.passwordError = ''; this.passwordMessage = '';
    if (this.newPassword.length < 8) { this.passwordError = 'Le nouveau mot de passe doit contenir au moins 8 caractères.'; return; }
    this.savingPassword = true;
    this.http.put('/api/users/me/password', { currentPassword: this.currentPassword, newPassword: this.newPassword }).subscribe({ next: () => { this.savingPassword = false; this.currentPassword = ''; this.newPassword = ''; this.passwordMessage = 'Mot de passe modifié.'; }, error: response => { this.savingPassword = false; this.passwordError = response.error?.message || 'Le changement du mot de passe a échoué.'; } });
  }
}
