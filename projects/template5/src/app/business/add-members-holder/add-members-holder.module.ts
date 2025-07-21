import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { AddMembersHolderComponent } from "./add-members-holder.component";
import { CapitalizeFirstPipeModule } from "jaldee-framework/pipes/capitalize";
import { FormMessageDisplayModule } from "jaldee-framework/form-message";
import { SharedModule } from "jaldee-framework/shared";
import { AddMemberModule } from "../add-member/add-member.module";
import { I8nModule } from "../../modules/i8n/i8n.module";

@NgModule({
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        CapitalizeFirstPipeModule,
        FormMessageDisplayModule,
        AddMemberModule,
        SharedModule,
        I8nModule
    ],
    declarations: [
        AddMembersHolderComponent
    ],
    exports: [
        AddMembersHolderComponent
    ]
})
export class AddMembersHolderModule { }