import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

interface ProfileForm { firstName: string; lastName: string; phone: string; birthDate: string | null; gender: string | null; bio: string; photoUrl: string; institutionOrWorkplace: string; preferredCity: string; budgetMin: number | null; budgetMax: number | null; smoker: boolean; hasPets: boolean; sleepSchedule: string | null; cleanlinessLevel: number | null; guestsAllowed: boolean; }
@Component({ selector: 'app-edit-profile', standalone: true, imports: [CommonModule, FormsModule, RouterLink], templateUrl: './edit-profile.html', styleUrl: './edit-profile.css' })
export class EditProfile implements OnInit {
  private http = inject(HttpClient); private router = inject(Router);
  form: ProfileForm = { firstName: '', lastName: '', phone: '', birthDate: null, gender: null, bio: '', photoUrl: '', institutionOrWorkplace: '', preferredCity: '', budgetMin: null, budgetMax: null, smoker: false, hasPets: false, sleepSchedule: null, cleanlinessLevel: null, guestsAllowed: true };
  loading = true; saving = false; error = ''; success = '';
  ngOnInit(): void { this.http.get<ProfileForm>('/api/users/me/profile').subscribe({ next: value => { this.form = { ...this.form, ...value }; this.loading = false; }, error: () => { this.error = 'Impossible de charger le profil.'; this.loading = false; } }); }
  save(): void {
    if (!this.form.firstName.trim() || !this.form.lastName.trim()) { this.error = 'Le prénom et le nom sont obligatoires.'; return; }
    if (this.form.budgetMin != null && this.form.budgetMax != null && this.form.budgetMin > this.form.budgetMax) { this.error = 'Le budget minimum ne peut pas dépasser le maximum.'; return; }
    this.saving = true; this.error = '';
    const payload = { ...this.form, phone: this.form.phone.trim() || null };
    this.http.put('/api/users/me/profile', payload).subscribe({ next: () => { this.saving = false; this.success = 'Profil mis à jour.'; setTimeout(() => this.router.navigate(['/profile']), 600); }, error: response => { this.saving = false; this.error = response.error?.message || 'La mise à jour a échoué. Vérifiez vos informations.'; } });
  }
}
