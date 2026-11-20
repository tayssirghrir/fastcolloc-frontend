import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Offer, OfferService } from '../../services/offer';

interface ListingControls {
  title: FormControl<string>;
  description: FormControl<string>;
  type: FormControl<string>;
  city: FormControl<string>;
  neighborhood: FormControl<string>;
  address: FormControl<string>;
  latitude: FormControl<number | null>;
  longitude: FormControl<number | null>;
  price: FormControl<number | null>;
  availableFrom: FormControl<string>;
  roomsCount: FormControl<number | null>;
  roommatesCount: FormControl<number | null>;
  furnished: FormControl<boolean>;
  smokersAllowed: FormControl<boolean>;
  petsAllowed: FormControl<boolean>;
  guestsAllowed: FormControl<boolean>;
}

@Component({
  selector: 'app-offer-create', standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './offer-create.html', styleUrl: './offer-create.css'
})
export class OfferCreate implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(OfferService);

  id: number | null = null;
  loading = false;
  saving = false;
  error = '';
  selectedFiles: File[] = [];
  existingPhotos: Array<{ id: number; url: string; position: number }> = [];

  form = new FormGroup<ListingControls>({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(120)] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(2000)] }),
    type: new FormControl('CHAMBRE', { nonNullable: true, validators: [Validators.required] }),
    city: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(80)] }),
    neighborhood: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(80)] }),
    address: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(255)] }),
    latitude: new FormControl<number | null>(36.8065, { validators: [Validators.required, Validators.min(-90), Validators.max(90)] }),
    longitude: new FormControl<number | null>(10.1815, { validators: [Validators.required, Validators.min(-180), Validators.max(180)] }),
    price: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0.01)] }),
    availableFrom: new FormControl('', { nonNullable: true }),
    roomsCount: new FormControl<number | null>(1, { validators: [Validators.min(0)] }),
    roommatesCount: new FormControl<number | null>(1, { validators: [Validators.min(0)] }),
    furnished: new FormControl(false, { nonNullable: true }),
    smokersAllowed: new FormControl(false, { nonNullable: true }),
    petsAllowed: new FormControl(false, { nonNullable: true }),
    guestsAllowed: new FormControl(true, { nonNullable: true })
  });

  ngOnInit(): void {
    const value = Number(this.route.snapshot.paramMap.get('id'));
    if (!value) return;
    this.id = value;
    this.loading = true;
    this.service.get(value).subscribe({
      next: offer => {
        this.form.patchValue({
          title: offer.title,
          description: offer.description ?? '',
          type: offer.type,
          city: offer.city,
          neighborhood: offer.neighborhood ?? '',
          address: offer.address ?? '',
          latitude: offer.latitude ?? null,
          longitude: offer.longitude ?? null,
          price: offer.price,
          availableFrom: offer.availableFrom ?? '',
          roomsCount: offer.roomsCount ?? null,
          roommatesCount: offer.roommatesCount ?? null,
          furnished: offer.furnished ?? false,
          smokersAllowed: offer.smokersAllowed ?? false,
          petsAllowed: offer.petsAllowed ?? false,
          guestsAllowed: offer.guestsAllowed ?? true
        });
        this.existingPhotos = offer.photos ?? [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Annonce introuvable ou inaccessible.';
        this.loading = false;
      }
    });
  }

  onFiles(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    if (files.some(file => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024)) {
      this.error = 'Choisissez des images JPEG, PNG ou WEBP de 5 Mo maximum.';
      return;
    }
    const remaining = Math.max(0, 6 - this.existingPhotos.length);
    this.selectedFiles = files.slice(0, remaining);
    if (files.length > remaining) this.error = `Maximum 6 photos : vous pouvez encore en ajouter ${remaining}.`;
    else this.error = '';
  }

  removePhoto(photoId: number): void {
    if (!this.id) return;
    this.service.deletePhoto(this.id, photoId).subscribe({
      next: () => this.existingPhotos = this.existingPhotos.filter(photo => photo.id !== photoId),
      error: () => this.error = 'La suppression de la photo a echoue.'
    });
  }

  setCover(photoId: number): void {
    if (!this.id) return;
    this.service.setCoverPhoto(this.id, photoId).subscribe({
      next: () => this.existingPhotos = this.existingPhotos
        .map(photo => ({ ...photo, position: photo.id === photoId ? 0 : photo.position + 1 }))
        .sort((a, b) => a.position - b.position),
      error: () => this.error = 'Impossible de modifier la photo principale.'
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Verifiez les champs obligatoires et les valeurs indiquees.';
      return;
    }
    this.saving = true;
    this.error = '';
    const value = this.form.getRawValue();
    const request = {
      ...value,
      title: value.title.trim(),
      city: value.city.trim(),
      description: value.description.trim() || null,
      neighborhood: value.neighborhood.trim() || null,
      address: value.address.trim() || null,
      availableFrom: value.availableFrom || null
    };
    const action = this.id ? this.service.update(this.id, request) : this.service.create(request);
    action.subscribe({
      next: offer => this.uploadPhotos(offer.id),
      error: response => {
        this.saving = false;
        this.error = response.error?.message || 'Enregistrement impossible. Verifiez les champs.';
      }
    });
  }

  private uploadPhotos(id: number): void {
    if (!this.selectedFiles.length) {
      this.saving = false;
      this.router.navigate(['/my-listings']);
      return;
    }
    const data = new FormData();
    this.selectedFiles.forEach(file => data.append('files', file));
    this.service.addPhotos(id, data).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/my-listings']);
      },
      error: () => {
        this.saving = false;
        this.error = 'Annonce enregistree, mais l\'envoi des photos a echoue. Vous pouvez reessayer depuis l\'edition.';
      }
    });
  }
}
