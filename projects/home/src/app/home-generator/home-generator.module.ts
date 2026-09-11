import { inject, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { firstValueFrom, isObservable } from 'rxjs';
import { EnvironmentService, I8nModule, setupInjectionContextForLoadChildren, SharedAccountGuard } from 'jconsumer-shared';

import { CrossTenantGuard } from '../cross-tenant/cross-tenant.guard';

const templateId = localStorage.getItem('_tid');
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
  setupInjectionContextForLoadChildren({
    path: '',
    canLoad: [async (route) => {
      // Capture both dependencies before awaiting: inject() needs a synchronous context.
      const sharedAccountGuard = inject(SharedAccountGuard);
      const crossTenantGuard = inject(CrossTenantGuard);
      // Run sequentially so account resolution finishes before preparing the target session.
      const accountResult = sharedAccountGuard.canLoad(route);
      const canLoadAccount = await (isObservable(accountResult) ? firstValueFrom(accountResult) : accountResult);
      if (!canLoadAccount) return false;
      return crossTenantGuard.canLoad(route);
    }],
    loadChildren: async () => {
      const environmentService = inject(EnvironmentService);
      const remoteUrl = environmentService.getEnvironment(templateId) + '/remoteEntry.json';
      //  remoteEntry: getVersionedRemoteEntry(remoteUrl),
      return loadRemoteModule({
        remoteEntry: getVersionedRemoteEntry(remoteUrl),
        // remoteEntry: remoteUrl,
        exposedModule: './Home'
      }).then(m => m.HomeModule);
    }
  })
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
