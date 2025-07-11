import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MaintenanceComponent } from './maintenance.component';
import { LoadingSpinnerModule } from 'jconsumer-shared';
const routes: Routes = [
  { path: '', component: MaintenanceComponent}
]
@NgModule({
    imports: [
      CommonModule,
      LoadingSpinnerModule,
      [RouterModule.forChild(routes)]
    ],
    declarations: [MaintenanceComponent],
    exports: [MaintenanceComponent]
})

export class MaintenanceModule {}
