import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { ApiEnvelope, ApiError } from '../models/content.model';

/** Thrown for any non-2xx API response, carrying the server's field errors. */
export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields: Record<string, string> = {}
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

/**
 * Low-level HTTP wrapper for the PHP API.
 *
 * Responsibilities:
 *  - unwraps the { ok, data } envelope so callers get the payload directly
 *  - sends the session cookie (withCredentials) and the CSRF header on writes
 *  - normalises every failure into an ApiRequestError with a message that is
 *    safe to show a non-technical user
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  /**
   * Same-origin in production (Apache serves /api alongside the SPA) and
   * proxied in development (see proxy.conf.json), so a relative base works in
   * both without a build-time switch.
   */
  private readonly baseUrl = '/api';

  private csrfToken = '';

  setCsrfToken(token: string): void {
    this.csrfToken = token;
  }

  getCsrfToken(): string {
    return this.csrfToken;
  }

  get<T>(path: string, params?: Record<string, string>): Observable<T> {
    return this.request<T>('GET', path, undefined, params);
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.request<T>('POST', path, body);
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.request<T>('PUT', path, body);
  }

  delete<T>(path: string, params?: Record<string, string>): Observable<T> {
    return this.request<T>('DELETE', path, undefined, params);
  }

  /** Multipart upload — the browser sets its own Content-Type boundary. */
  upload<T>(path: string, formData: FormData): Observable<T> {
    return this.http
      .post<ApiEnvelope<T>>(`${this.baseUrl}${path}`, formData, {
        withCredentials: true,
        headers: new HttpHeaders({ 'X-CSRF-Token': this.csrfToken })
      })
      .pipe(
        map(envelope => envelope.data),
        catchError((error: HttpErrorResponse) => throwError(() => this.toApiError(error)))
      );
  }

  private request<T>(
    method: string,
    path: string,
    body?: unknown,
    params?: Record<string, string>
  ): Observable<T> {
    let headers = new HttpHeaders({
      // Content edits must never come back from a cached response.
      'Cache-Control': 'no-cache'
    });

    if (method !== 'GET') {
      headers = headers.set('Content-Type', 'application/json');
      headers = headers.set('X-CSRF-Token', this.csrfToken);
    }

    return this.http
      .request<ApiEnvelope<T>>(method, `${this.baseUrl}${path}`, {
        body,
        headers,
        params: params ? new HttpParams({ fromObject: params }) : undefined,
        withCredentials: true
      })
      .pipe(
        map(envelope => envelope.data),
        catchError((error: HttpErrorResponse) => throwError(() => this.toApiError(error)))
      );
  }

  private toApiError(error: HttpErrorResponse): ApiRequestError {
    const payload = error.error as { error?: ApiError } | null;
    const apiError = payload?.error;

    if (apiError) {
      return new ApiRequestError(error.status, apiError.code, apiError.message, apiError.fields ?? {});
    }

    // Nothing answered at all — offline, DNS failure, server down.
    if (error.status === 0) {
      return new ApiRequestError(
        0,
        'network_error',
        'Could not reach the server. Check your connection and try again.'
      );
    }

    // Something answered, but not this API: a 404/5xx carrying an HTML page
    // rather than our JSON envelope. That means the backend is not installed or
    // not routing here — which is exactly what a static-only host (GitHub Pages)
    // looks like, so say so instead of a vague "something went wrong".
    if (typeof error.error === 'string' || error.status === 404 || error.status === 502 || error.status === 503) {
      return new ApiRequestError(
        error.status,
        'api_unavailable',
        'The content service is not responding. If this is a preview or test site, the admin dashboard only works where the backend is installed.'
      );
    }

    return new ApiRequestError(
      error.status,
      'unexpected_error',
      'Something went wrong. Please try again.'
    );
  }
}
