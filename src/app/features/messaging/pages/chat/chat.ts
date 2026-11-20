import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Conversation { listingId: number; listingTitle: string; otherUserId: number; otherUserName: string; lastMessage: string; updatedAt: string; unreadCount: number; }
interface Message { id: number; listingId: number; senderId: number; senderName: string; recipientId: number; body: string; sentAt: string; readAt: string | null; }
@Component({ selector: 'app-chat', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './chat.html', styleUrl: './chat.css' })
export class Chat implements OnInit {
  private http = inject(HttpClient); private route = inject(ActivatedRoute);
  conversations: Conversation[] = []; messages: Message[] = []; current: Conversation | null = null;
  body = ''; loading = true; error = ''; sending = false;
  ngOnInit(): void {
    this.http.get<Conversation[]>('/api/messages').subscribe({ next: list => { this.conversations = list; this.loading = false; const listingId = Number(this.route.snapshot.queryParamMap.get('listingId')); const otherId = Number(this.route.snapshot.queryParamMap.get('userId')); const conversation = list.find(item => item.listingId === listingId && item.otherUserId === otherId); if (conversation) this.open(conversation); else if (listingId && otherId) { this.current = { listingId, otherUserId: otherId, listingTitle: 'Nouvelle conversation', otherUserName: 'Propriétaire', lastMessage: '', updatedAt: new Date().toISOString(), unreadCount: 0 }; this.loadThread(); } }, error: () => { this.loading = false; this.error = 'Impossible de charger vos conversations.'; } });
  }
  open(conversation: Conversation): void { this.current = conversation; this.error = ''; this.loadThread(); }
  private loadThread(): void { if (!this.current) return; this.http.get<Message[]>(`/api/messages/${this.current.listingId}/${this.current.otherUserId}`).subscribe({ next: items => { this.messages = items; this.current!.unreadCount = 0; }, error: () => this.error = 'Impossible d’ouvrir cette conversation.' }); }
  send(): void { if (!this.current || !this.body.trim() || this.sending) return; this.sending = true; this.http.post<Message>(`/api/messages/${this.current.listingId}/${this.current.otherUserId}`, { body: this.body.trim() }).subscribe({ next: message => { this.messages = [...this.messages, message]; this.body = ''; this.sending = false; this.http.get<Conversation[]>('/api/messages').subscribe(items => this.conversations = items); }, error: () => { this.sending = false; this.error = 'Envoi du message impossible.'; } }); }
}
