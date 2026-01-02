import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";
import { RouterModule, Routes } from "@angular/router";
import { AuthenticationModule } from "../../shared/authentication/authentication.module";
import { ConsumerHistoryComponent } from "./history.component";
import { InvoiceListModule } from "../../shared/invoice-list/invoice-list.module";
import { CapitalizeFirstPipeModule, I8nModule, TruncateModule } from "jconsumer-shared";
import { TranslateModule } from '@ngx-translate/core';
import { AddInboxMessagesModule } from "../../shared/add-inbox-messages/add-inbox-messages.module";
import { RateServiceModule } from "../../shared/rate-service-popup/rate-service-popup.module";
import { ViewRxModule } from "../../shared/view-rx/view-rx.module";
const routes: Routes = [
    { path: '', component: ConsumerHistoryComponent }
];

@NgModule({
    imports:[
        CommonModule,
        RouterModule.forChild(routes),
        MatIconModule,
        MatMenuModule,
        MatButtonModule,
        MatTooltipModule,
        MatDialogModule,
        AuthenticationModule,
        InvoiceListModule,
        I8nModule,
        CapitalizeFirstPipeModule,
        TruncateModule,
        TranslateModule,
        AddInboxMessagesModule,
        RateServiceModule,
        ViewRxModule
    ],
    exports:[
        ConsumerHistoryComponent
    ],
    declarations:[
        ConsumerHistoryComponent
    ]
})
export class ConsumerHistoryModule{}
