import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-termscondition',
  templateUrl: './termscondition.component.html',
  styleUrls: ['./termscondition.component.css']
})
export class TermsconditionComponent implements OnInit {
  @Input() content;
  @Input() path;

  ngOnInit() {
  }
}
