import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
interface NotificationItem { id: number; type: string; title: string; message: string; listingId: number; otherUserId: number; createdAt: string; read: boolean; }
@Component({ selector: 'app-notifications', standalone: true, imports: [CommonModule, RouterLink], templateUrl: './notifications.html', styleUrl: './notifications.css' })
export class Notifications implements OnInit {
 private http = inject(HttpClient); items: NotificationItem[] = []; loading = true; error = '';
 ngOnInit(): void { this.http.get<NotificationItem[]>('/api/notifications').subscribe({ next: items => { this.items = items; this.loading = false; }, error: () => { this.error = 'Impossible de charger les notifications.'; this.loading = false; } }); }
}
