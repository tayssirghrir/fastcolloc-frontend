import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';
import { RegisterRequest } from '../../../../shared/models/auth.model';

interface QuizQuestion {
  prompt: string;
  answers: string[];
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  readonly steps = ['Compte', 'Localisation', 'Profil', 'Contact', 'Photos', 'Personnalité'];
  readonly cities = ['Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba', 'Kairouan', 'Kasserine', 'Kébili', 'Le Kef', 'Mahdia', 'Manouba', 'Médenine', 'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse', 'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan'];
  readonly activities = ['Étudiant·e', 'Salarié·e', 'Freelance', "En recherche d'emploi", 'Doctorant·e'];
  readonly interests = ['Sport', 'Musique', 'Lecture', 'Cinéma', 'Gaming', 'Cuisine', 'Voyages', 'Art', 'Yoga', 'Randonnée'];
  readonly languages = ['Arabe', 'Français', 'Anglais', 'Allemand', 'Espagnol', 'Italien'];
  readonly availability = ['Matin', 'Après-midi', 'Soir', 'WE matin', 'WE après-midi', 'WE soir'];
  readonly quiz: QuizQuestion[] = [
    { prompt: 'Vous rentrez chez vous le soir…', answers: ['Avant 20h 🏙️', 'Entre 20h et 22h 🌆', 'Après 22h 🌃', 'Ça dépend des jours 🌻'] },
    { prompt: 'Le week-end, vous êtes plutôt…', answers: ['Cocooning à la maison 🏡', 'Sorties entre amis 🎉', 'Sport & activités 🏃', 'Moitié-moitié 😌'] },
    { prompt: 'Votre rapport au silence dans l’appartement…', answers: ["J’adore le calme total 🤫", "Un peu de musique c’est bien 🎵", "J’aime l’ambiance animée 🔊", 'Je mets un casque de toute façon 🎧'] },
    { prompt: 'Les invités chez vous…', answers: ['Jamais 🚫', 'Rarement, avec accord 🏢', 'Parfois, si prévenus 👍', 'Souvent, la porte est ouverte 🥳'] },
    { prompt: 'La cuisine partagée, c’est…', answers: ['Chacun ses affaires 📦', 'On partage les basiques 🧂', 'On cuisine ensemble parfois 👩‍🍳', 'Frigo commun total 🤝'] },
    { prompt: 'Votre niveau d’organisation…', answers: ['Très ordonné·e 📐', 'Plutôt propre 🧹', 'Acceptable, pas maniaque 😅', 'Je fais le ménage le WE 🧽'] },
    { prompt: 'Si un conflit arrive…', answers: ["J’en parle directement 💬", "J’attends le bon moment ⏰", 'Je préfère un message 📱', 'Je demande à médiatiser 🤝'] },
    { prompt: 'Avec les animaux…', answers: ["J’adore les animaux 🐕", 'OK si propres 🐈', 'Plutôt non, allergie 🤧', "Non, pas d’animaux 🚫"] }
  ];

  readonly form: FormGroup;
  currentStep = 0;
  errorMessage = '';
  successMessage = '';
  loading = false;
  readonly photos: Array<{ file: File; url: string } | null> = Array(6).fill(null);

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      firstName: ['', Validators.required], lastName: ['', Validators.required], email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]], gender: ['', Validators.required], age: ['', [Validators.required, Validators.min(18), Validators.max(100)]],
      country: ['Tunisie', Validators.required], city: ['', Validators.required], postalCode: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      activity: ['', Validators.required], interests: [[] as string[]], nationality: ['Tunisienne'], smoker: ['Non'], cleanliness: [5], languages: [[] as string[]], bio: [''],
      phone: ['', Validators.required], availability: [[] as string[]], instagram: [''], whatsapp: [''], linkedin: [''],
      quizAnswers: this.fb.array(this.quiz.map(() => this.fb.control('')))
    });
  }

  get quizAnswers(): FormArray { return this.form.get('quizAnswers') as FormArray; }
  get answeredCount(): number { return (this.form.get('quizAnswers')?.value as string[]).filter(Boolean).length; }

  toggleValue(controlName: string, value: string): void {
    const control = this.form.get(controlName);
    const selected = (control?.value ?? []) as string[];
    control?.setValue(selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value]);
  }

  isSelected(controlName: string, value: string): boolean {
    return ((this.form.get(controlName)?.value ?? []) as string[]).includes(value);
  }

  next(): void {
    this.errorMessage = '';
    const fields = this.fieldsForStep(this.currentStep);
    fields.forEach(field => this.form.get(field)?.markAsTouched());
    if (fields.some(field => this.form.get(field)?.invalid)) return;
    if (this.currentStep < this.steps.length - 1) this.currentStep++;
  }

  previous(): void {
    this.errorMessage = '';
    if (this.currentStep > 0) this.currentStep--;
  }

  private fieldsForStep(step: number): string[] {
    return [
      ['firstName', 'lastName', 'email', 'password', 'gender', 'age'],
      ['country', 'city', 'postalCode'],
      ['activity'],
      ['phone'], [], []
    ][step] ?? [];
  }

  onPhotoSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'Choisissez une image JPG, PNG ou WEBP de 5 Mo maximum.';
      input.value = '';
      return;
    }
    if (this.photos[index]) URL.revokeObjectURL(this.photos[index]!.url);
    this.photos[index] = { file, url: URL.createObjectURL(file) };
    this.errorMessage = '';
  }

  removePhoto(index: number): void {
    if (this.photos[index]) URL.revokeObjectURL(this.photos[index]!.url);
    this.photos[index] = null;
  }

  onSubmit(): void {
    this.errorMessage = '';
    let invalidStep = -1;
    for (let step = 0; step <= 3; step++) {
      const fields = this.fieldsForStep(step);
      fields.forEach(field => this.form.get(field)?.markAsTouched());
      if (fields.some(field => this.form.get(field)?.invalid)) { invalidStep = step; break; }
    }
    if (invalidStep >= 0) {
      this.currentStep = invalidStep;
      return;
    }

    const value = this.form.getRawValue();
    const studentActivities = ['Étudiant·e', 'Doctorant·e'];
    const payload: RegisterRequest = {
      firstName: value.firstName.trim(), lastName: value.lastName.trim(), email: value.email.trim(), password: value.password,
      role: studentActivities.includes(value.activity) ? 'ETUDIANT' : 'TRAVAILLEUR'
    };
    this.loading = true;
    this.authService.register(payload).subscribe({
      next: () => {
        const { password, email, firstName, lastName, ...profileDetails } = value;
        localStorage.setItem('fastcolloc-registration-details', JSON.stringify({ ...profileDetails, photos: this.photos.filter(Boolean).map(photo => photo?.file.name) }));
        this.loading = false;
        this.successMessage = 'Votre compte a été créé avec succès !';
        setTimeout(() => this.router.navigate(['/login']), 1300);
      },
      error: error => {
        this.loading = false;
        const fields = error.error?.fields;
        this.errorMessage = (fields ? Object.values(fields).join(' ') : '') || error.error?.message ||
          (error.status === 0 ? 'Serveur injoignable. Vérifiez que le backend est démarré.' : `Erreur HTTP ${error.status}`);
      }
    });
  }
}
