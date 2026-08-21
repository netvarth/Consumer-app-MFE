import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDialogModule } from "@angular/material/dialog";
import { ConsumerEmailComponent } from "./consumer-email.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatCheckboxModule
    ],
    exports: [
        ConsumerEmailComponent
    ],
    declarations: [
        ConsumerEmailComponent
    ]
})
export class ConsumerEmailModule {}