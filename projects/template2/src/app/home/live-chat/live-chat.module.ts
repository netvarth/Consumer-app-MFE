import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { LiveChatComponent } from "./live-chat.component";
import { MatMenuModule } from "@angular/material/menu";
import { MatIconModule } from "@angular/material/icon";
import { MessageService } from "primeng/api";
import { ToastModule } from "primeng/toast";
import { LoadingSpinnerModule, ToastService, RequestDialogModule, MediaService } from "jconsumer-shared";
import { RouterModule, Routes } from "@angular/router";
import { AuthenticationModule } from "../../shared/authentication/authentication.module";
import { TwilioService } from "./twilio-service";
import { LinkExpiredComponent } from "./link-expired/link-expired.component";
import { TeleBookingService } from "../../shared/tele-bookings-service";

const routes: Routes = [
    { path: '', component: LiveChatComponent }
];

@NgModule({
    declarations: [
        LiveChatComponent
    ],
    imports: [
        CommonModule,
        RequestDialogModule,
        LoadingSpinnerModule,
        MatMenuModule,
        MatIconModule,
        ToastModule,
        AuthenticationModule,
        LinkExpiredComponent,
        RouterModule.forChild(routes)
    ],
    exports: [
        LiveChatComponent
    ],
    providers: [
        TwilioService,
        MessageService,
        ToastService,
        MediaService,
        TeleBookingService
    ]
})
export class LiveChatModule { }