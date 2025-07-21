import { loadRemoteModule } from '@angular-architects/native-federation';
import { CommonModule } from '@angular/common';
import { inject, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TemplateGuard } from './template.guard';
import { EnvironmentService, setupInjectionContextForLoadChildren } from 'jconsumer-shared';
let remoteEntry = '';
const routes: Routes = [
  setupInjectionContextForLoadChildren({
    runGuardsAndResolvers: 'always',
    canLoad: [TemplateGuard],
    path: '', loadChildren: async (environmentService = inject(EnvironmentService)) => {
      const templateId = localStorage.getItem('_tid');
      remoteEntry = environmentService.getEnvironment('HOME') + '/remoteEntry.json';
      
      console.log("Template ID:", templateId);
      // 
      return loadRemoteModule({
        remoteEntry: remoteEntry,
        exposedModule: './DynamicHome'
      }).then(m => m.HomeGeneratorModule)
        .catch(err => {
          console.error('Error loading Home module:', err);
          // Handle error accordingly (e.g., navigate to an error page)
        })
    }
  })
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],
})

export class TemplateModule { }

