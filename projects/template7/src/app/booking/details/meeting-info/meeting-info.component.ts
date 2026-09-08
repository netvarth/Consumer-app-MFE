import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-meeting-info',
  templateUrl: './meeting-info.component.html',
  styleUrl: './meeting-info.component.scss'
})
export class MeetingInfoComponent {

  @Input() meetingInfo;
  @Input() callingMode;
  @Input() callingChannel;
  @Input() callingNumber;

  constructor() {

  }

}
