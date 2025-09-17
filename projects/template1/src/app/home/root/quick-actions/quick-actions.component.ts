import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from 'jconsumer-shared';

@Component({
  selector: 'app-quick-actions',
  templateUrl: './quick-actions.component.html',
  styleUrls: ['./quick-actions.component.css']
})
export class QuickActionsComponent implements OnInit {
  @Input() actionList;
  @Output() actionPerformed = new EventEmitter<any>();

  constructor(
    private router:Router,
    private sharedService: SharedService
  ) { }
  
  ngOnInit(): void {
    console.log("file",this.actionList);
  }
  
  cardActionPerformed(action) {
    if (action.link && action.link.startsWith('http')) {
      window.open(action.link, "_system");
    } else if (action.link){
      this.router.navigateByUrl(this.sharedService.getRouteID() + "/" + action.link);
    } else if (action.type==='menu') {
      this.actionPerformed.emit(action);
    }
  }
}
