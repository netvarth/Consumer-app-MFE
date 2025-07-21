import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CapitalizeFirstPipeModule } from 'jaldee-framework/pipes/capitalize';
import { LoadingSpinnerModule } from 'jaldee-framework/spinner';
import { SharedModule } from 'jaldee-framework/shared';
import { I8nModule } from '../../modules/i8n/i8n.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        LoadingSpinnerModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        MatIconModule,
        MatMenuModule,
        MatButtonModule,
        SharedModule,
        I8nModule,
        CapitalizeFirstPipeModule
    ],
    declarations: [HeaderComponent],
    exports: [HeaderComponent]
})
export class HeaderModule {
}
