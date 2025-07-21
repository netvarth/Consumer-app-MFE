import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TeleHomeComponent } from "./tele-home.component";

const routes: Routes = [
    { path: '', component: TeleHomeComponent},
    { path: ':id', loadChildren: () => import('../live-chat/live-chat.module').then(m => m.LiveChatModule)},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class TeleHomeRoutingModule {}