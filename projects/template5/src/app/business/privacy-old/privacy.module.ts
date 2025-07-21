import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { PrivacyComponent } from "./privacy.component";

@NgModule({
    declarations: [PrivacyComponent],
    exports: [PrivacyComponent],
    imports: [
        CommonModule
    ]
})
export class PrivacyModule{}