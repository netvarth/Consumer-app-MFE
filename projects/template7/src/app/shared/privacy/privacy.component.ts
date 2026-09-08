import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss']
})
export class PrivacyComponent implements OnInit {
  @Input() path;
  @Input() content;
  constructor() { }
  ngOnInit(): void {
  }
}
