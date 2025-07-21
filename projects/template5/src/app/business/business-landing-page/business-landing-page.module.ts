import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { BookingService } from "../../services/booking-service";
import { BusinessLandingPageComponent } from "./business-landing-page.component";
import { I8nModule } from "../../modules/i8n/i8n.module";

const routes: Routes = [
    {
        path: '', component: BusinessLandingPageComponent,
        children: [
            {
                path: '',
                children: [
                    { path: 'template1', loadChildren: () => import('../templates/cust-template1/cust-template1.module').then(m => m.CustTemplate1Module) },
                    { path: 'template3', loadChildren: () => import('../templates/cust-template3/cust-template3.module').then(m => m.CustTemplate3Module) },
                    { path: 'template4', loadChildren: () => import('../templates/cust-template4/cust-template4.module').then(m => m.CustTemplate4Module) },
                    { path: 'template5', loadChildren: () => import('../templates/cust-template5/cust-template5.module').then(m => m.CustTemplate5Module) },
                    { path: 'template6', loadChildren: () => import('../templates/cust-template6/cust-template6.module').then(m => m.CustTemplate6Module) },
                    { path: 'template7', loadChildren: () => import('../templates/cust-template7/cust-template7.module').then(m => m.CustTemplate7Module) },
                    { path: 'template8', loadChildren: () => import('../templates/cust-template8/cust-template8.module').then(m => m.CustTemplate8Module) },
                    { path: 'template9', loadChildren: () => import('../templates/cust-template9/cust-template9.module').then(m => m.CustTemplate9Module) },
                    { path: 'template10', loadChildren: () => import('../templates/cust-template10/cust-template10.module').then(m => m.CustTemplate10Module) },
                    { path: 'template12', loadChildren: () => import('../templates/cust-template12/cust-template12.module').then(m => m.CustTemplate12Module) }
                ]
            }
        ]
    }
]

@NgModule({
    declarations: [
        BusinessLandingPageComponent
    ],
    imports: [
        CommonModule,
        I8nModule,
        [RouterModule.forChild(routes)]
    ],
    exports: [
        BusinessLandingPageComponent
    ],
    providers: [
        BookingService
    ]
})
export class BusinessLandingPageModule { }