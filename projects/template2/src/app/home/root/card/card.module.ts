import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CardComponent } from './card.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CapitalizeFirstPipeModule, I8nModule, LoadingSpinnerModule, TruncateModule } from 'jconsumer-shared';

@NgModule({
    declarations: [
        CardComponent
    ],
    imports: [
        CommonModule,
        TruncateModule,
        CapitalizeFirstPipeModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        LoadingSpinnerModule,
        I8nModule
    ],
    exports: [
        CardComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
    ]
})
export class CardModule {
}