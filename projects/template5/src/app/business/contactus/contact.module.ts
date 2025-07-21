import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ContactComponent } from "./contact.component";

@NgModule({
    declarations: [ContactComponent],
    exports: [ContactComponent],
    imports: [
        CommonModule
    ]
})
export class ContactModule{}