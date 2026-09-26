import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminApiService } from '../services/admin-api.service';
import { ConfirmService } from '../services/confirm.service';
import { ToastService } from '../services/toast.service';
import { ApiRequestError } from '../../services/api.service';
import { ContactMessage } from '../../models/content.model';

/**
 * Contact form enquiries.
 *
 * These are emailed as they arrive; this screen is the safety net, because
 * PHP's mail() on shared hosting fails quietly often enough that email alone
 * would lose enquiries. A message whose email did not go out is flagged.
 */
@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [DatePipe],
  template: `
    <header class="admin__page-header">
      <div>
        <h1 class="admin__title">Messages</h1>
        <p class="admin__subtitle">
          Enquiries from the contact form on your website. Each one is also emailed to you as it
          arrives — this is a copy so nothing gets lost.
        </p>
      </div>
    </header>

    @if (loading()) {
      <p class="admin__loading"><span class="admin__spinner"></span> Loading messages…</p>
    } @else if (loadError()) {
      <div class="admin__notice admin__notice--error" role="alert">{{ loadError() }}</div>
    } @else if (messages().length === 0) {
      <p class="admin__empty">No messages yet. They will appear here as people use the contact form.</p>
    } @else {
      @if (unread() > 0) {
        <div class="admin__notice">
          <strong>{{ unread() }}</strong> unread message{{ unread() === 1 ? '' : 's' }}.
        </div>
      }

      @for (message of messages(); track message.id) {
        <article class="admin__card" [style.border-left]="message.isRead ? null : '3px solid #1a1a1a'">
          <div style="display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; align-items: flex-start">
            <div>
              <p style="font-weight: 600; font-size: 1rem">
                {{ message.name }}
                @if (!message.isRead) {
                  <span class="admin__badge" style="margin-left: 0.5rem">New</span>
                }
              </p>
              <p class="admin__list-meta" style="margin-top: 0.25rem">
                <a [href]="'mailto:' + message.email">{{ message.email }}</a>
                @if (message.phone) { <span>{{ message.phone }}</span> }
                <span>{{ message.createdAt | date: 'MMM d, y, h:mm a' }}</span>
              </p>
            </div>

            <div class="admin__list-actions">
              <a [href]="replyLink(message)" class="admin__btn admin__btn--small">Reply</a>
              <button
                type="button"
                class="admin__btn admin__btn--secondary admin__btn--small"
                (click)="toggleRead(message)"
              >{{ message.isRead ? 'Mark unread' : 'Mark read' }}</button>
              <button
                type="button"
                class="admin__btn admin__btn--danger admin__btn--small"
                (click)="remove(message)"
              >Delete</button>
            </div>
          </div>

          @if (message.strainName) {
            <p class="admin__notice" style="margin: 0.9rem 0 0">
              Wholesale enquiry about <strong>{{ message.strainName }}</strong>
            </p>
          }

          <p style="margin-top: 0.9rem; white-space: pre-wrap; line-height: 1.7">{{ message.message }}</p>

          @if (!message.emailSent) {
            <p class="admin__notice admin__notice--warn" style="margin: 0.9rem 0 0">
              The notification email for this one could not be sent, so you may not have received it
              in your inbox. The message itself is safe here.
            </p>
          }
        </article>
      }
    }
  `
})
export class AdminMessagesComponent implements OnInit {
  private readonly adminApi = inject(AdminApiService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  readonly messages = signal<ContactMessage[]>([]);
  readonly unread = signal(0);
  readonly loading = signal(true);
  readonly loadError = signal('');

  ngOnInit(): void {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.loadError.set('');

    try {
      const result = await this.adminApi.getMessages();
      this.messages.set(result.messages);
      this.unread.set(result.unread);
    } catch (error) {
      this.loadError.set(error instanceof ApiRequestError ? error.message : 'Could not load messages.');
    } finally {
      this.loading.set(false);
    }
  }

  replyLink(message: ContactMessage): string {
    const subject = message.strainName
      ? `Re: Wholesale enquiry — ${message.strainName}`
      : 'Re: Your message to Lead Farmer';
    return `mailto:${message.email}?subject=${encodeURIComponent(subject)}`;
  }

  async toggleRead(message: ContactMessage): Promise<void> {
    try {
      const updated = await this.adminApi.markMessageRead(message.id, !message.isRead);
      this.messages.update(list => list.map(m => (m.id === message.id ? updated : m)));
      this.unread.update(n => Math.max(0, n + (updated.isRead ? -1 : 1)));
    } catch {
      this.toast.error('Could not update that message.');
    }
  }

  async remove(message: ContactMessage): Promise<void> {
    const confirmed = await this.confirm.askDelete(`the message from ${message.name}`);
    if (!confirmed) {
      return;
    }

    try {
      await this.adminApi.deleteMessage(message.id);
      this.messages.update(list => list.filter(m => m.id !== message.id));
      if (!message.isRead) {
        this.unread.update(n => Math.max(0, n - 1));
      }
      this.toast.success('Message deleted.');
    } catch {
      this.toast.error('Could not delete that message.');
    }
  }
}
