import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
@Component({
  selector: 'app-fill-qnr',
  templateUrl: './fill-qnr.component.html',
  styleUrls: ['./fill-qnr.component.scss']
})
export class FillQnrComponent implements OnInit {
  btnDisabled: boolean = false;
  questionAnswers: any;
  questionnaireList: any;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private config: DynamicDialogConfig,
    private dialogRef: DynamicDialogRef,
  ) { }

  ngOnInit(): void {
    if (this.config.data) {
      this.questionnaireList = this.config.data;
      console.log(this.config.data, 'this.options')
    }
  }
  validateQnr() {
    this.dialogRef.close(this.questionAnswers);
  }
  goBack() {
    this.dialogRef.close();
  }
  getQuestionAnswers(event: any) {
    this.questionAnswers = event;
    console.log(this.questionAnswers)
  }
}
