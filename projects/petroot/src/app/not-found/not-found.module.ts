import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NotFoundComponent } from './not-found.component';
const routes: Routes = [
    {path: '', component: NotFoundComponent}
];
@NgModule({
    imports: [
        CommonModule,
        [RouterModule.forChild(routes)]
    ],
    declarations: [NotFoundComponent]
})
export class NotFoundModule {}
