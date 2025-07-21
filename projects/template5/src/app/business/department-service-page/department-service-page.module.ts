import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { DepartmentServicePageComponent } from "./department-service-page.component";
import { GalleryModule } from "@ks89/angular-modal-gallery";
import { RouterModule, Routes } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { BookingService } from "../../services/booking-service";
import { AddInboxMessagesModule } from "../add-inbox-messages/add-inbox-messages.module";
import { LoadingSpinnerModule } from "jaldee-framework/spinner";
import { SafeHtmlModule } from "jaldee-framework/pipes/safe-html";
import { SharedModule } from "jaldee-framework/shared";
import { QRCodeGeneratordetailModule } from "jaldee-framework/qrcode/generator";
import { CouponsModule } from "jaldee-framework/coupons";
import { BasicProfileNewModule } from "../../modules/profile/basic-profile-new/basic-profile-new.module";
import { OnlineUsersModule } from "../../modules/online-users/online-users.module";
import { CardModule } from "../../modules/card/card.module";
import { BasicProfileModule } from "../../modules/profile/basic-profile/basic-profile.module";
import { AppointmentServicesModule } from "../../modules/services/appointment/appointment-services.module";
import { CheckinServicesModule } from "../../modules/services/checkin/checkin-services.module";
import { I8nModule } from "../../modules/i8n/i8n.module";
const routes: Routes = [
    {path: '', component: DepartmentServicePageComponent}
];
@NgModule({
    imports:[
        CommonModule,
        CardModule,
        LoadingSpinnerModule,
        GalleryModule,
        SafeHtmlModule,
        MatButtonModule,
        BasicProfileModule,
        AppointmentServicesModule,
        CheckinServicesModule,
        SharedModule,
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