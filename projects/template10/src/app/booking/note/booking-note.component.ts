import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-booking-note',
  templateUrl: './booking-note.component.html',
  styleUrls: ['./booking-note.component.css']
})
export class BookingNoteComponent implements OnInit {

  @Output() noteChanged = new EventEmitter<any>();
  @Input() note;
  @Input() placeholder;
  @Input() selectedService;
  @Input() businessProfile;


  constructor() { }

  ngOnInit(): void {
  }

  handleConsumerNote(note) {
    this.noteChanged.emit(note);
  }
}
