import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDialogModule } from "@angular/material/dialog";
import { MatTooltipModule } from "@angular/material/tooltip";
import { RouterModule, Routes } from "@angular/router";
import { OrderBillComponent } from "./order-bill.component";
import { MatRadioModule } from "@angular/material/radio";
import { CapitalizeFirstPipeModule, LoadingSpinnerModule, PaymentModesModule, PaytmService, RazorpayService } from "jconsumer-shared";
import { SharedModule } from "primeng/api";
const routes: Routes= [
    {path: '', component: OrderBillComponent}
]
@NgModule({
    declarations: [OrderBillComponent],
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatTooltipModule,
        MatCheckboxModule,
        LoadingSpinnerModule,
        CapitalizeFirstPipeModule,
        MatRadioModule,
        PaymentModesModule,
        SharedModule,
        [RouterModule.forChild(routes)]
    ],
    exports: [OrderBillComponent],
    providers: [RazorpayService, PaytmService]
})
export class OrderBillModule {}