import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CheckYourStatusComponent } from './check-status.component';
const routes: Routes = [
    { path: '', component: CheckYourStatusComponent }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CheckStatusRoutingModule { }
