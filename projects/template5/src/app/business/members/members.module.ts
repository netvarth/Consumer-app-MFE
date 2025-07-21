import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { RouterModule, Routes } from "@angular/router";
import { MembersComponent } from "./members.component";
import { MatButtonModule } from "@angular/material/button";
import { AddMembersHolderModule } from "../add-members-holder/add-members-holder.module";
import { ConfirmBoxModule } from "jaldee-framework/confirm";
import { CapitalizeFirstPipeModule } from "jaldee-framework/pipes/capitalize";
import { SharedModule } from "jaldee-framework/shared";
import { I8nModule } from "../../modules/i8n/i8n.module";
const routes: Routes = [
    { path: '', component: MembersComponent }
];
@NgModule({
    imports: [
        [RouterModule.forChild(routes)],
        AddMembersHolderModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        ConfirmBoxModule,
        CapitalizeFirstPipeModule,
        CommonModule,
        SharedModule,
        I8nModule
    ],
    declarations: [
        MembersComponent
    ],
    exports: [
        MembersComponent
    ]
})
export class MembersModule {}