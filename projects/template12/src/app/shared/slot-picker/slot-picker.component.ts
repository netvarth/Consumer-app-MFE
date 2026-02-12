import { Component, EventEmitter, input, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-slot-picker',
  templateUrl: './slot-picker.component.html',
  styleUrls: ['./slot-picker.component.scss']
})
export class SlotPickerComponent implements OnInit {

  @Input() slots; // all slots
  @Input() selectedSlot: any = []; // slots to be selected
  @Output() slotSelected = new EventEmitter<any>(); // return the selected slots
  @Input() mode; // appt/checkin
  @Input() multiple; // To enable multiple selection
  @Input() theme: string | null = null;
  @Input() variant: 'default' | 'pill' = 'default';
  showMoreAvailableSlots = true; // Toggle number of slots to be displayed
  multipleSelection = false;
  smallDevice:boolean;
  ngOnInit(): void {
    console.log("Slots:", this.slots);
    console.log("Selected Slot:", this.selectedSlot);

    if (this.multiple > 1) {
      this.multipleSelection = true;
    } else {
      this.multipleSelection = false;
    }
    this. onResizeDevice();
  }
  slotPicked(slot) {
    this.selectedSlot = slot;
    this.slotSelected.emit(this.selectedSlot);
  }
  onResizeDevice() {
    if (window.innerWidth <= 767) {
      this.smallDevice = true;
      this.showMoreAvailableSlots=false;
    } else {
      this.smallDevice = false;
    }
  }
  showMoreTimeSlots() {
    this.showMoreAvailableSlots = !this.showMoreAvailableSlots;
  }

  processSlots(slot) {
    const index = this.selectedSlot.indexOf(slot);
    if (this.multipleSelection) {
      if (this.selectedSlot.length === this.multiple && index === -1) {
        return false;
      }
      if (index === -1) {
        this.selectedSlot.push(slot);
      } else {
        if (this.selectedSlot.length > 1) {
          this.selectedSlot.splice(index, 1);
        }
      }
    } else {
      this.selectedSlot = [];
      this.selectedSlot.push(slot);
    }
    this.slotSelected.emit(this.selectedSlot);
    return true;
  }

}
