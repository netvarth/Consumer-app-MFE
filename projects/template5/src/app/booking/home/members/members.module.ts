import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatMenuModule } from "@angular/material/menu";
import { MembersComponent } from "./members.component";
import { MatButtonModule } from "@angular/material/button";
import { CapitalizeFirstPipeModule, ConfirmBoxModule, ErrrorMessageModule, I8nModule, ToastService } from "jconsumer-shared";
import { MessageService } from "primeng/api";
import { AddMembersHolderModule } from "../../../home/add-members-holder/add-members-holder.module";
import { MatRadioButton, MatRadioModule } from "@angular/material/radio";

@NgModule({
    imports: [
        AddMembersHolderModule,
        MatMenuModule,
        MatButtonModule,
        ConfirmBoxModule,
        CapitalizeFirstPipeModule,
        CommonModule,
        I8nModule,
        MatRadioModule,
        ErrrorMessageModule
    ],
    declarations: [
        MembersComponent
    ],
    exports: [
        MembersComponent
    ],
    providers: [ ToastService, MessageService ]
})
export class MembersModule {}