import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";
import { Routes } from "@angular/router";
import { AddInboxMessagesModule } from "../add-inbox-messages/add-inbox-messages.module";
import { AuthenticationModule } from "../authentication/authentication.module";
import { TeleHomeRoutingModule } from "./tele-home-routing.module";
import { TeleHomeComponent } from "./tele-home.component";
import { CapitalizeFirstPipeModule, I8nModule, LoadingSpinnerModule } from "jconsumer-shared";

const routes: Routes = [
    { path: '', component: TeleHomeComponent},
    { path: ':id', loadChildren: () => import('../live-chat/live-chat.module').then(m => m.LiveChatModule)},
];
@NgModule({
    declarations: [
        TeleHomeComponent
    ],
    imports: [
        CommonModule,
        TeleHomeRoutingModule,
        LoadingSpinnerModule,
        CapitalizeFirstPipeModule,
        MatMenuModule,
        MatGridListModule,
        MatTooltipModule,
        MatIconModule,
        SharedModule,
        I8nModule,
        AddInboxMessagesModule,
        AuthenticationModule
    ],
    exports: [
        TeleHomeComponent
    ],
    providers: [
        TeleBookingService  
    ]
})

export class TeleHomeModule {}