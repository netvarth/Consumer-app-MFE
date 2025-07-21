import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InboxOuterComponent } from './inbox-outer.component';
import { NgxNl2brModule } from "ngx-nl2br";
import { HeaderModule } from '../../header/header.module';
import { InboxServices } from '../inbox.service';
import { AuthenticationModule } from '../../authentication/authentication.module';
import { LoadingSpinnerModule } from 'jaldee-framework/spinner';
import { CapitalizeFirstPipeModule } from 'jaldee-framework/pipes/capitalize';
import { FileService } from 'jaldee-framework/file';
import { AutolinkPipeModule } from 'jaldee-framework/pipes/autolink';
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
        HeaderModule,
        LoadingSpinnerModule,
        AuthenticationModule,
        AutolinkPipeModule
    ],
    declarations: [
      InboxOuterComponent
    ],
    exports: [InboxOuterComponent],
    providers: [
      InboxServices,
      FileService
    ]
})
export class InboxModule {
}
