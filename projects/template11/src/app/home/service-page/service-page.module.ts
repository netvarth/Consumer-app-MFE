import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxNl2brModule } from "ngx-nl2br";
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Routes, RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { ServicePageComponent } from './service-page.component';
import { RatingStarModule } from '../../shared/ratingstar/ratingstar.module';
import { CapitalizeFirstPipeModule, DateFormatPipeModule, LoadingSpinnerModule, TruncateModule } from 'jconsumer-shared';
import { CardModule } from '../root/card/card.module';
import { BasicProfileModule } from '../../shared/profile/basic-profile/basic-profile.module';
import { BasicProfileNewModule } from '../../shared/profile/basic-profile-new/basic-profile-new.module';


const routes: Routes = [
    { path: '', component: ServicePageComponent }
];
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RatingStarModule,
        CapitalizeFirstPipeModule,
        DateFormatPipeModule,
        NgxNl2brModule,
        LoadingSpinnerModule,
        TruncateModule,
        CardModule,
        MatDialogModule,
        MatTooltipModule,
        BasicProfileModule,
        MatMenuModule,
        BasicProfileNewModule,
        [RouterModule.forChild(routes)]
    ],
    declarations: [
        ServicePageComponent
    ],
    exports: [
        ServicePageComponent
    ]
})
export class ServicePageModule { }
