// Local visual QA of the built, integrated HomeModule with mocked account services.
// Build first: ng build template7 --configuration development --dev=false
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const built = path.join(workspace, 'dist/template7/browser');
const manifest = JSON.parse(await readFile(path.join(built, 'remoteEntry.json'), 'utf8'));
const imports = Object.fromEntries(manifest.shared.map(item => [item.packageName, '/remote/' + item.outFileName]));
const homeEntry = manifest.exposes.find(item => item.key === './Home').outFileName;
const port = Number(process.env.TEMPLATE7_PREVIEW_PORT || 9047);
const mime = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.svg': 'image/svg+xml' };

const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="/capp/">
<title>Template 7 — local fixture preview</title>
<link id="font-awesome-css" rel="stylesheet" href="/font-awesome/css/font-awesome.min.css">
<style>html,body{margin:0;padding:0}body{font-family:Arial,sans-serif}button,input{font:inherit}</style>
<script type="importmap">${JSON.stringify({ imports })}</script><script src="/zone.js"></script></head>
<body><home-preview></home-preview><script type="module" src="/preview.js"></script></body></html>`;

const bootstrap = `
import { publishFacade } from '@angular/compiler';
import { Component, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { provideRouter, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of, Subject } from 'rxjs';
import * as shared from 'jconsumer-shared';
import { HomeModule } from '/remote/${homeEntry}';
const config = await (await fetch('/config.json')).json();
publishFacade(globalThis);
const parameters = new URLSearchParams(location.search);
if (parameters.get('type') === 'service') config.homePage.type = 'service';
const locations = [{ id: 12, place: 'Preview location' }];
const account = { location: locations, businessProfile: { id: 1, customId: 'preview', businessName: 'Chota Boss' } };
const messages = new Subject();
let activeLocation = locations[0];
const state = {
  getTemplateJSON: () => config, getRouteID: () => 'preview', getAccountID: () => 1,
  getAccountInfo: () => account, getAccountConfig: () => ({ loginRequired: false }),
  getJson: value => typeof value === 'string' ? JSON.parse(value) : value,
  getCDNPath: () => '/', getUIPath: () => '/', getCustomID: () => 'preview', getI8nPath: () => '/i18n/'
};
class PreviewApp {}
Component({ selector: 'home-preview', standalone: true, imports: [RouterOutlet], template: '<router-outlet />' })(PreviewApp);
const app = await bootstrapApplication(PreviewApp, { providers: [
  provideRouter([{ path: 'preview', loadChildren: () => HomeModule }]), provideNoopAnimations(), provideHttpClient(), MessageService,
  importProvidersFrom(TranslateModule.forRoot()),
  { provide: shared.SharedService, useValue: state },
  { provide: shared.AccountService, useValue: {
    getJson: state.getJson, getActiveLocation: () => activeLocation, setActiveLocation: value => activeLocation = value,
    getAccountLocations: () => locations, setAccountLocations: () => {}, getStores: () => [{ encId: 'preview' }]
  } },
  { provide: shared.AuthService, useValue: { goThroughLogin: async () => false } },
  { provide: shared.LocalStorageService, useValue: { getitemfromLocalStorage: () => null, setitemonLocalStorage: () => {}, removeitemfromLocalStorage: () => {} } },
  { provide: shared.GroupStorageService, useValue: { getitemFromGroupStorage: () => null } },
  { provide: shared.SubscriptionService, useValue: { getMessage: () => messages, sendMessage: value => messages.next(value) } },
  { provide: shared.OrderService, useValue: { getRequireOTPForAddingToCart: () => of({ requireOTPForAddingToCart: false }) } },
  { provide: shared.ThemeService, useValue: { loadTheme: () => {} } },
  { provide: shared.ConsumerService, useValue: {} },
  { provide: shared.ServiceMeta, useValue: { httpGet: () => of([]) } }
] });
window.homePreview = { config, refresh: () => app.tick() };
`;

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/config.json') {
      res.setHeader('Content-Type', 'application/json');
      res.end(await readFile(path.join(workspace, 'projects/template7/template_CA.json'))); return;
    }
    if (url.pathname === '/preview.js') { res.setHeader('Content-Type', 'text/javascript'); res.end(bootstrap); return; }
    if (url.pathname.startsWith('/i18n/')) { res.setHeader('Content-Type', 'application/json'); res.end('{}'); return; }
    if (url.pathname.startsWith('/capp/preview')) { res.setHeader('Content-Type', 'text/html'); res.end(html); return; }
    let root = built;
    let relative = url.pathname.replace(/^\/remote\//, '');
    if (url.pathname.startsWith('/capp/assets/')) { root = path.join(workspace, 'projects/template7/public'); relative = url.pathname.slice(6); }
    if (url.pathname === '/zone.js') { root = path.join(workspace, 'node_modules/zone.js/bundles'); relative = 'zone.umd.js'; }
    if (url.pathname.startsWith('/font-awesome/')) { root = path.join(workspace, 'node_modules/font-awesome'); relative = url.pathname.slice(14); }
    const file = path.resolve(root, relative.replace(/^\//, ''));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log('Template 7 fixture preview: http://127.0.0.1:' + port + '/capp/preview'));
