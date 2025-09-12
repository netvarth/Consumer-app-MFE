import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingNoteComponent } from './booking-note.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    BookingNoteComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    BookingNoteComponent
  ]
})
export class BookingNoteModule { }
