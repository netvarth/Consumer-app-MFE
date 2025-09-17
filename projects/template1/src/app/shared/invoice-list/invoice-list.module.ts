import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";
import { MatTooltipModule } from "@angular/material/tooltip";
import { InvoiceListComponent } from "./invoice-list.component";
import { CapitalizeFirstPipeModule, I8nModule, LoadingSpinnerModule, PaymentModesModule, PaymentsModule } from "jconsumer-shared";

@NgModule({
    imports:[
        MatDialogModule,
        MatTooltipModule,
        LoadingSpinnerModule,
        CommonModule,
        FormsModule,
        CapitalizeFirstPipeModule,
        PaymentModesModule,
        I8nModule,
        PaymentsModule
    ],
    exports:[InvoiceListComponent],
    declarations:[InvoiceListComponent]
})
export class InvoiceListModule{}