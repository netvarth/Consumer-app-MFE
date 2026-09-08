import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { RouterModule, Routes } from "@angular/router";
import { MembersComponent } from "./members.component";
import { MatButtonModule } from "@angular/material/button";
import { CapitalizeFirstPipeModule, ConfirmBoxModule, ErrrorMessageModule, I8nModule } from "jconsumer-shared";
import { AddMembersHolderModule } from "../add-members-holder/add-members-holder.module";
const routes: Routes = [
    { path: '', component: MembersComponent }
];
@NgModule({
    imports: [
        AddMembersHolderModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        ConfirmBoxModule,
        CapitalizeFirstPipeModule,
        CommonModule,
        I8nModule,
        ErrrorMessageModule,
        [RouterModule.forChild(routes)]
    ],
    declarations: [
        MembersComponent
    ],
    exports: [
        MembersComponent
    ]
})
export class MembersModule {}