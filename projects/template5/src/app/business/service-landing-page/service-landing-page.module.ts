import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GalleryModule} from '@ks89/angular-modal-gallery';
import { NgxNl2brModule } from "ngx-nl2br";
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Routes, RouterModule } from '@angular/router';
import { ServiceLandingPageComponent } from './service-landing-page.component';
import { MatMenuModule } from '@angular/material/menu';
import { LoadingSpinnerModule } from 'jaldee-framework/spinner';
import { CapitalizeFirstPipeModule } from 'jaldee-framework/pipes/capitalize';
import { TruncateModule } from 'jaldee-framework/pipes/limit-to';
import { RatingStarModule } from 'jaldee-framework/ratingstar';
import { BasicProfileNewModule } from '../../modules/profile/basic-profile-new/basic-profile-new.module';
import { CardModule } from '../../modules/card/card.module';
import { BasicProfileModule } from '../../modules/profile/basic-profile/basic-profile.module';

const routes: Routes = [
    { path: '', component: ServiceLandingPageComponent }
];
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RatingStarModule,
        CapitalizeFirstPipeModule,
        GalleryModule,
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
        ServiceLandingPageComponent
    ],
    exports: [
        ServiceLandingPageComponent
    ]
})
export class ServiceLandingPageModule { }
