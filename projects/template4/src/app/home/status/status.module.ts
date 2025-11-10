import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { NgxNl2brModule } from "ngx-nl2br";
import { StatusComponent } from "./status.component";
import { MatButtonModule } from "@angular/material/button";
import { TableModule } from "primeng/table";
import { RouterModule, Routes } from "@angular/router";
import { CapitalizeFirstPipeModule, I8nModule, LoadingSpinnerModule } from "jconsumer-shared";

const routes: Routes = [
    { path: '', component: StatusComponent }
];

@NgModule({
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        LoadingSpinnerModule,
        CapitalizeFirstPipeModule,
        NgxNl2brModule,
        TableModule,
        FormsModule,
        ReactiveFormsModule,
        I8nModule,
        MatButtonModule,
        RouterModule.forChild(routes)
    ],
    declarations: [
        StatusComponent
    ]
})
export class StatusModule {}