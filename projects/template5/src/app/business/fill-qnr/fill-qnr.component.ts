import { Component, Inject, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { LocalStorageService } from 'jaldee-framework/storage/local';
@Component({
  selector: 'app-fill-qnr',
  templateUrl: './fill-qnr.component.html',
  styleUrls: ['./fill-qnr.component.scss']
})
export class FillQnrComponent implements OnInit {
  btnDisabled: boolean = false;
  questionAnswers: any;
  questionnaireList: any;
  constructor( private location: Location,

    @Inject(MAT_DIALOG_DATA) public data: any,
    private config: DynamicDialogConfig,
    private lStorageService: LocalStorageService,
    private dialogRef: DynamicDialogRef,
    ) { }

  ngOnInit(): void {
    if (this.config.data) {
      this.questionnaireList = this.config.data;
      console.log(this.config.data,'this.options')
    }
  }
  validateQnr(){
    this.dialogRef.close(this.questionAnswers);
  }
  goBack() {
    this.dialogRef.close();
  }
//   getQuestionAnswers(event) {
//     this.questionAnswers = event;
// }
getQuestionAnswers(event) {
  this.questionAnswers = event;
  console.log(this.questionAnswers)
 
}
}
