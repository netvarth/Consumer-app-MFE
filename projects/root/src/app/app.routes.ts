import { loadRemoteModule } from '@angular-architects/native-federation';
import { Routes } from '@angular/router';
import { AccountGuard } from './account.guard';
import { projectConstants } from '../environment';

const getVersionedRemoteEntry = (entry: string): string => {
  if (typeof localStorage === 'undefined') {
    return entry;
  }
  const currentVersion = localStorage.getItem('c_sversion');
  if (!currentVersion) {
    return entry;
  }

  const sanitizedVersion = currentVersion.replace(/^["']+|["']+$/g, '');

  try {
    const remoteUrl = new URL(entry);
    remoteUrl.searchParams.set('v', sanitizedVersion);
    return remoteUrl.toString();
  } catch (error) {
    return `${entry}${entry.includes('?') ? '&' : '?'}v=${sanitizedVersion}`;
  }
};


export const routes: Routes = [
  { path: 'not-found', loadChildren: () => import('./not-found/not-found.module').then(m => m.NotFoundModule) },
  { path: 'maintenance', loadChildren: () => import('./maintenance/maintenance.module').then(m => m.MaintenanceModule) },
  {
    // Base href is /capp/, so the router sees just ":id" (not "capp/:id")
    path: ':id',
    canLoad: [AccountGuard],  // Guard to prevent navigation if condition fails
    loadChildren: () =>
      new Promise<any>((resolve, reject) => {
        console.log(projectConstants.TEMPLATE + '/remoteEntry.json');
        const remoteUrl = projectConstants.TEMPLATE + '/remoteEntry.json';
        loadRemoteModule({
          remoteEntry: getVersionedRemoteEntry(remoteUrl),
          exposedModule: './Template'
        })
          .then(m => resolve(m.TemplateModule))  // Resolve with the loaded module
          .catch(err => reject('Error loading remote module: ' + err));
      })
  }
];
