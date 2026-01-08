import { inject,  NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { EnvironmentService, I8nModule, setupInjectionContextForLoadChildren, SharedAccountGuard } from 'jconsumer-shared';

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
    canLoad: [SharedAccountGuard],
    loadChildren: async () => {
      const environmentService = inject(EnvironmentService);
      const remoteUrl = environmentService.getEnvironment(templateId) + '/remoteEntry.json';
      //  remoteEntry: getVersionedRemoteEntry(remoteUrl),
      return loadRemoteModule({
        remoteEntry: getVersionedRemoteEntry(remoteUrl),
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
