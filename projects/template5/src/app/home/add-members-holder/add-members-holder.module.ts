import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { AddMembersHolderComponent } from "./add-members-holder.component";
import { AddMemberModule } from "../add-member/add-member.module";
import { CapitalizeFirstPipeModule, ErrrorMessageModule, FormMessageDisplayModule, I8nModule, ToastService } from "jconsumer-shared";
import { MessageService } from "primeng/api";

@NgModule({
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        CapitalizeFirstPipeModule,
        FormMessageDisplayModule,
        AddMemberModule,
        I8nModule,
        ErrrorMessageModule
    ],
    declarations: [
        AddMembersHolderComponent
    ],
    exports: [
        AddMembersHolderComponent
    ],
    providers:[ToastService, MessageService]
})
export class AddMembersHolderModule { }