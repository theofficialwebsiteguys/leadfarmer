import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiRequestError, ApiService } from '../../services/api.service';

/**
 * The public contact form.
 *
 * The strain's wholesale button links here with `?strain=<name>#contact`, which
 * pre-fills the enquiry so a visitor does not have to retype which product they
 * are asking about.
 *
 * Anti-spam is a hidden honeypot input plus a per-IP cap enforced server-side —
 * no CAPTCHA, since visitors are anonymous and the volume is low.
 */
@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss'
})
export class ContactFormComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  @Input() submitLabel = 'Send Message';

  form = {
    name: '',
    email: '',
    phone: '',
    message: '',
    strainName: '',
    /** Honeypot — hidden from people, irresistible to bots. Must stay empty. */
    website: ''
  };

  readonly sending = signal(false);
  readonly sent = signal(false);
  readonly errorMessage = signal('');
  readonly fieldErrors = signal<Record<string, string>>({});

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const strain = params.get('strain');
      if (strain) {
        this.form.strainName = strain;
        if (!this.form.message) {
          this.form.message = `I'd like to ask about wholesale availability for ${strain}.`;
        }
      }
    });
  }

  errorFor(field: string): string | undefined {
    return this.fieldErrors()[field];
  }

  async submit(): Promise<void> {
    if (this.sending()) {
      return;
    }

    this.sending.set(true);
    this.errorMessage.set('');
    this.fieldErrors.set({});

    try {
      await firstValueFrom(this.api.post('/contact', this.form));
      this.sent.set(true);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        this.fieldErrors.set(error.fields);
        this.errorMessage.set(error.message);
      } else {
        this.errorMessage.set('Your message could not be sent. Please try again, or email us directly.');
      }
    } finally {
      this.sending.set(false);
    }
  }

  /** Lets someone send a second enquiry without reloading the page. */
  reset(): void {
    this.form = { name: '', email: '', phone: '', message: '', strainName: '', website: '' };
    this.sent.set(false);
    this.errorMessage.set('');
    this.fieldErrors.set({});
  }
}
