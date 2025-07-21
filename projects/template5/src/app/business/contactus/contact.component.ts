import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit{
  @Input() content;
  @Input() emailList;
  @Input() phoneList;
  @Input() address;

  showCustom = false;
  customEmail = false;
  customPhone = false;

  loading = true;
  constructor(
    //  private lStorageService: LocalStorageService
  ) { }
  ngOnInit() {
    console.log(this.content);
    console.log(this.emailList);
    console.log(this.phoneList);
    if (this.content) {
      this.showCustom = true;
    } else {
      this.showCustom = false;
      if (this.emailList && this.emailList.length > 0) {
        this.customEmail = true;
      }
      if (this.phoneList && this.phoneList.length > 0) {
        this.customPhone = true;
      }
    }
    console.log(this.customEmail);
    console.log(this.customPhone);
    this.loading = false;
  }
}
