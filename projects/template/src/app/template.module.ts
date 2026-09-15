import { loadRemoteModule } from '@angular-architects/native-federation';
import { CommonModule } from '@angular/common';
import { ENVIRONMENT_INITIALIZER, NgModule, Provider } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TemplateGuard } from './template.guard';
import { EnvironmentService } from 'jconsumer-shared';
let remoteEntry = '';
let environmentService: EnvironmentService;

const environmentInitializerProvider: Provider = {
  provide: ENVIRONMENT_INITIALIZER,
  multi: true,
  deps: [EnvironmentService],
  useFactory: (service: EnvironmentService) => () => {
    environmentService = service;
  }
};

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

const routes: Routes = [
  {
    path: '',
    providers: [environmentInitializerProvider],
    children: [{
      runGuardsAndResolvers: 'always',
      canLoad: [TemplateGuard],
      path: '',
      loadChildren: async () => {
        const templateId = localStorage.getItem('_tid');
        remoteEntry = environmentService.getEnvironment('HOME') + '/remoteEntry.json';

        console.log("Template ID:", templateId);
        //
        return loadRemoteModule({
          remoteEntry: getVersionedRemoteEntry(remoteEntry),
          // remoteEntry: remoteEntry,
          exposedModule: './DynamicHome'
        }).then(m => m.HomeGeneratorModule)
          .catch(err => {
            console.error('Error loading Home module:', err);
            // Handle error accordingly (e.g., navigate to an error page)
          })
      }
    }]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],
})

export class TemplateModule { }

