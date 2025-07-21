import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-privacy-old',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.css']
})
export class PrivacyComponent implements OnInit {
  @Input() content;
  @Input() path;
  ngOnInit() {
  }
}
