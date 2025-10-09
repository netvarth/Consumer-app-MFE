import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ServiceInfoComponent } from "./service-info.component";
import { CapitalizeFirstPipeModule } from "jconsumer-shared";

@NgModule({
    imports:[
        CommonModule,
        CapitalizeFirstPipeModule
    ],
    exports:[ServiceInfoComponent],
    declarations:[ServiceInfoComponent]
})
export class ServiceInfoModule{}