import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";
import { RouterModule, Routes } from "@angular/router";
import { NgxNl2brModule } from "ngx-nl2br";
import { UserPageComponent } from "./user-page.component";
import { CapitalizeFirstPipeModule, I8nModule, LoadingSpinnerModule } from "jconsumer-shared";
import { QRCodeGeneratordetailModule } from "../../../shared/qrcode/qrcodegeneratordetail.module";
import { CouponsModule } from "../../../shared/coupons/coupons.module";
import { BasicProfileModule } from "../basic-profile/basic-profile.module";
import { AddInboxMessagesModule } from "../../../shared/add-inbox-messages/add-inbox-messages.module";
import { AppointmentServicesModule } from "../services/appointment/appointment-services.module";
import { CheckinServicesModule } from "../services/checkin/checkin-services.module";
import { OnlineUsersModule } from "../online-users/online-users.module";
import { ConsDepartmentsModule } from "../departments/cons-departments.module";
import { BasicProfileNewModule } from "../../../shared/profile/basic-profile-new/basic-profile-new.module";
import { UserLocationModule } from "./user-location/user-location.module";
import { BookingService } from "../../../booking/booking.service";

const routes: Routes = [
    { path: '', component: UserPageComponent },
    { path: 'about', loadChildren: () => import('./about/about.module').then(m => m.AboutUserModule)},
    { path: 'service/:serid', loadChildren: () => import('../../service-page/service-page.module').then(m => m.ServicePageModule) }
]

@NgModule({
    declarations: [
        UserPageComponent
    ],
    imports: [
        CommonModule,
        LoadingSpinnerModule,
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
        OnlineUsersModule,
        ConsDepartmentsModule,
        BasicProfileNewModule,
        [RouterModule.forChild(routes)]
    ],
    exports: [
        UserPageComponent
    ],
    providers: [
        BookingService
    ]
})
export class UserPageModule { }