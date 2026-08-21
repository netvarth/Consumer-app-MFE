import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InboxOuterComponent } from './inbox-outer.component';
import { NgxNl2brModule } from "ngx-nl2br";
import { AutolinkPipeModule, CapitalizeFirstPipeModule, ErrrorMessageModule, FileService, JGalleryModule, LoadingSpinnerModule } from 'jconsumer-shared';
const routes: Routes = [
  { path: '', component: InboxOuterComponent}
];
@NgModule({
    imports: [
        CapitalizeFirstPipeModule,
        CommonModule,
        [RouterModule.forChild(routes)],
        ReactiveFormsModule,
        FormsModule,
        NgxNl2brModule,
        LoadingSpinnerModule,
        AutolinkPipeModule,
        ErrrorMessageModule,
        JGalleryModule
    ],
    declarations: [
      InboxOuterComponent
    ],
    exports: [InboxOuterComponent],
    providers: [
      FileService
    ]
})
export class InboxModule {
}
