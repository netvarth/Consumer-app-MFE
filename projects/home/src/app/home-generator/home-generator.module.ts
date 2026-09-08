import { ENVIRONMENT_INITIALIZER, NgModule, Provider } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { EnvironmentService, I8nModule } from 'jconsumer-shared';
import { CrossTenantGuard } from '../cross-tenant/cross-tenant.guard';

const templateId = localStorage.getItem('_tid');
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

const routes: Routes = [];
console.log("Template ID in Home Generator Module", templateId);

routes.push(
  {
    path: '',
    providers: [environmentInitializerProvider],
    children: [{
      path: '',
      canLoad: [CrossTenantGuard],
      loadChildren: async () => {
        const remoteUrl = environmentService.getEnvironment(templateId) + '/remoteEntry.json';
        //  remoteEntry: getVersionedRemoteEntry(remoteUrl),
        return loadRemoteModule({
          remoteEntry: getVersionedRemoteEntry(remoteUrl),
          // remoteEntry: remoteUrl,
          exposedModule: './Home'
        }).then(m => m.HomeModule);
      }
    }]
  }
)


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CarouselModule,
    I8nModule,
    [RouterModule.forChild(routes)]
  ],
  exports: [
  ]
})
export class HomeGeneratorModule {
}
