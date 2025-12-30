import { inject,  NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { EnvironmentService, I8nModule, setupInjectionContextForLoadChildren, SharedAccountGuard } from 'jconsumer-shared';

const templateId = localStorage.getItem('_tid');

const routes: Routes = [];
console.log("Template ID in Home Generator Module", templateId);

routes.push(
  setupInjectionContextForLoadChildren({
    path: '',
    canLoad: [SharedAccountGuard],
    loadChildren: async () => {
      const environmentService = inject(EnvironmentService);
      const remoteUrl = environmentService.getEnvironment(templateId) + '/remoteEntry.json';
      return loadRemoteModule({
        remoteEntry: remoteUrl,
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
