import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { RouterModule, Routes } from "@angular/router";
import { ContactModule } from "../contactus/contact.module";
import { PrivacyModule } from "../privacy-old/privacy.module";
import { RefundcancelModule } from "../refundcancel/refundcancel.module";
import { TermsconditionModule } from "../termscondition/termscondition.module";
import { BusinessPageHomeComponent } from "./business-page-home.component";
const routes: Routes = [
    { path: '', component: BusinessPageHomeComponent}
];
@NgModule({
    imports: [
        CommonModule,
        MatIconModule,
        MatToolbarModule,
        MatSidenavModule,
        MatButtonModule,
        ContactModule,
        PrivacyModule,
        MatDividerModule,
        MatSidenavModule,
        RefundcancelModule,
        TermsconditionModule,
        [RouterModule.forChild(routes)]
    ],
    declarations: [
        BusinessPageHomeComponent
    ]
})
export class BusinessPageHomeModule { }