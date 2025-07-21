import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";
import { RouterModule, Routes } from "@angular/router";
import { CouponsModule } from "jaldee-framework/coupons";
import { CapitalizeFirstPipeModule } from "jaldee-framework/pipes/capitalize";
import { QRCodeGeneratordetailModule } from "jaldee-framework/qrcode/generator";
import { SharedModule } from "jaldee-framework/shared";
import { LoadingSpinnerModule } from "jaldee-framework/spinner";
import { NgxNl2brModule } from "ngx-nl2br";
import { BookingService } from "../../services/booking-service";
import { AddInboxMessagesModule } from "../add-inbox-messages/add-inbox-messages.module";
import { BusinessUserLandingPageComponent } from "./business-user-landing-page.component";
import { UserLocationModule } from "../user-location/user-location.module";
import { BasicProfileNewModule } from "../../modules/profile/basic-profile-new/basic-profile-new.module";
import { ConsDepartmentsModule } from "../../modules/departments/cons-departments.module";
import { OnlineUsersModule } from "../../modules/online-users/online-users.module";
import { BasicProfileModule } from "../../modules/profile/basic-profile/basic-profile.module";
import { AppointmentServicesModule } from "../../modules/services/appointment/appointment-services.module";
import { CheckinServicesModule } from "../../modules/services/checkin/checkin-services.module";
import { DonationServicesModule } from "../../modules/services/donation/donation-services.module";
import { I8nModule } from "../../modules/i8n/i8n.module";

const routes: Routes = [
    { path: '', component: BusinessUserLandingPageComponent },
    { path: 'about', loadChildren: () => import('../about-user/about-user.module').then(m => m.AboutUserModule)},
    { path: 'service/:serid', loadChildren: () => import('../service-landing-page/service-landing-page.module').then(m => m.ServiceLandingPageModule) }
]

@NgModule({
    declarations: [
        BusinessUserLandingPageComponent
    ],
    imports: [
        CommonModule,
        LoadingSpinnerModule,
        SharedModule,
        I8nModule,
        MatTooltipModule,
        NgxNl2brModule,
        CapitalizeFirstPipeModule,
        QRCodeGeneratordetailModule,
        CouponsModule,
        UserLocationModule,
        BasicProfileModule,
        MatIconModule,
        MatMenuModule,
        AddInboxMessagesModule,
        AppointmentServicesModule,
        CheckinServicesModule,
        DonationServicesModule,
        OnlineUsersModule,
        ConsDepartmentsModule,
        BasicProfileNewModule,
        [RouterModule.forChild(routes)]
    ],
    exports: [
        BusinessUserLandingPageComponent
    ],
    providers: [
        BookingService
    ]
})
export class BusinessUserLandingPageModule { }