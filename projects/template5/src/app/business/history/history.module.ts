import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";
import { RouterModule, Routes } from "@angular/router";
import { CapitalizeFirstPipeModule } from "jaldee-framework/pipes/capitalize";
import { SharedModule } from "jaldee-framework/shared";
import { LoadingSpinnerModule } from "jaldee-framework/spinner";
import { ViewRxModule } from "jaldee-framework/view-rx";
import { AddInboxMessagesModule } from "../add-inbox-messages/add-inbox-messages.module";
import { AuthenticationModule } from "../authentication/authentication.module";
import { CheckinPaymentModule } from "../checkin-payment/checkin-payment.module";
import { RateServiceModule } from "../consumer-rate-service-popup/rate-service-popup.module";
import { ConsumerHistoryComponent } from "./history.component";
import { I8nModule } from "../../modules/i8n/i8n.module";
import { InvoiceListModule } from "../invoice-list/invoice-list.module";
const routes: Routes = [
    { path: '', component: ConsumerHistoryComponent }
];

@NgModule({
    imports:[
        CapitalizeFirstPipeModule,
        MatIconModule,
        MatMenuModule,
        MatTooltipModule,
        MatDialogModule,
        CommonModule,
        LoadingSpinnerModule,
        MatButtonModule,
        CheckinPaymentModule,
        AddInboxMessagesModule,
        RateServiceModule,
        ViewRxModule,
        InvoiceListModule,
        AuthenticationModule,
        [RouterModule.forChild(routes)],
        SharedModule,
        I8nModule
    ],
    exports:[
        ConsumerHistoryComponent
    ],
    declarations:[
        ConsumerHistoryComponent
    ]
})
export class ConsumerHistoryModule{}