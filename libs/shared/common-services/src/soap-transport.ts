/* istanbul ignore file */
import { InjectionToken } from '@angular/core';

/** Sends a SOAP request (an HTTP POST) and gives the status and body of the answer. */
export type SoapTransport = (request: {
  host: string;
  port: number;
  auth: string;
  body: string;
}) => Promise<{ status: number; body: string }>;

/** Node's http module, in the desktop app (nodeIntegration): the browser's fetch is held back by CORS. */
export const nodeSoapTransport: SoapTransport = ({ host, port, auth, body }) =>
  new Promise((resolve, reject) => {
    const http = window.require('http') as typeof import('http');
    const request = http.request(
      { host, port, method: 'POST', path: '/', auth, headers: { 'Content-Type': 'text/xml; charset=utf-8' }, timeout: 10_000 },
      (response) => {
        let data = '';
        response.setEncoding('utf8');
        response.on('data', (chunk: string) => (data += chunk));
        response.on('end', () => resolve({ status: response.statusCode ?? 0, body: data }));
      },
    );
    request.on('timeout', () => request.destroy(new Error(`No answer from ${host}:${port}`)));
    request.on('error', reject);
    request.end(body);
  });

export const SOAP_TRANSPORT = new InjectionToken<SoapTransport>('SOAP_TRANSPORT', { factory: () => nodeSoapTransport });
