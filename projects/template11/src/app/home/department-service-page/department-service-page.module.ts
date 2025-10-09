import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { DepartmentServicePageComponent } from "./department-service-page.component";
import { RouterModule, Routes } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { CardModule } from "../root/card/card.module";
import { I8nModule, LoadingSpinnerModule, SafeHtmlModule } from "jconsumer-shared";
import { BasicProfileModule } from "../root/basic-profile/basic-profile.module";
import { CouponsModule } from "../../shared/coupons/coupons.module";
import { OnlineUsersModule } from "../root/online-users/online-users.module";
import { AddInboxMessagesModule } from "../../shared/add-inbox-messages/add-inbox-messages.module";
import { BasicProfileNewModule } from "../../shared/profile/basic-profile-new/basic-profile-new.module";
import { QRCodeGeneratordetailModule } from "../../shared/qrcode/qrcodegeneratordetail.module";
import { BookingService } from "../../booking/booking.service";
import { AppointmentServicesModule } from "../root/services/appointment/appointment-services.module";
import { CheckinServicesModule } from "../root/services/checkin/checkin-services.module";

const routes: Routes = [
    {path: '', component: DepartmentServicePageComponent}
];
@NgModule({
    imports:[
        CommonModule,
        CardModule,
        LoadingSpinnerModule,
        // GalleryModule,
        SafeHtmlModule,
        MatButtonModule,
        BasicProfileModule,
        AppointmentServicesModule,
        CheckinServicesModule,
        I8nModule,
        CouponsModule,
        OnlineUsersModule,
        AddInboxMessagesModule,
        BasicProfileNewModule,
        QRCodeGeneratordetailModule,
        [RouterModule.forChild(routes)]
    ],
    exports:[
        DepartmentServicePageComponent
    ],
    declarations:[
        DepartmentServicePageComponent
    ],
    providers: [
        BookingService
    ]
})
export class DepartmentServicePageModule {}