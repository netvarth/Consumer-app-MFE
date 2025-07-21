import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { LiveChatRoutingModule } from "./live-chat-routing.module";
import { LiveChatComponent } from "./live-chat.component";
import { MatMenuModule } from "@angular/material/menu";
import { MatIconModule } from "@angular/material/icon";
import { TeleBookingService } from "../../services/tele-bookings-service";
import { LoadingSpinnerModule } from "jaldee-framework/spinner";
import { MediaService } from "jaldee-framework/media";
import { RequestDialogModule } from "jaldee-framework/request-dialog";
import { TwilioService } from "../../services/twilio-service";
import { MessageService } from "primeng/api";
import { ToastService } from "../../services/toast.service";
import { ToastModule } from "primeng/toast";

@NgModule({
    declarations: [
        LiveChatComponent
    ],
    imports: [
        CommonModule,
        LiveChatRoutingModule,
        RequestDialogModule,
        LoadingSpinnerModule,
        MatMenuModule,
        MatIconModule,
        ToastModule
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
export class LiveChatModule {}