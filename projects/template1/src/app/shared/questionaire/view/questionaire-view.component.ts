import { Component, Input, OnInit } from '@angular/core';
import { CommonService, FileService, SharedService } from 'jconsumer-shared';

@Component({
  selector: 'app-questionaire-view',
  templateUrl: './questionaire-view.component.html',
  styleUrls: ['./questionaire-view.component.css']
})
export class QuestionaireViewComponent implements OnInit {

  groupedQnr: any = [];
  @Input() questionaire: any;
  @Input() source: any;
  questions: any;
  questionnaire_heading = '';
  questionAnswers: any;
  answers: any;
  dataGridColumnsAnswerList: any;
  dataGridColumns: any = {};

  newDateFormat = 'EEE, MMM dd, y';

  constructor(
    private commonService: CommonService,
    private fileService: FileService,
    private sharedService: SharedService
  ) { }

  ngOnInit(): void {
    this.newDateFormat = this.sharedService.getDateFormat();
    this.questions = this.questionaire.questionAnswers;
    console.log("Questions:", this.questions);
    this.groupQuestionsBySection();
    this.getAnswers = (this.questions);
  }

  openFile(file: any) {
    window.open(file, '_blank');
  }

  groupQuestionsBySection() {
    if (this.source === 'customer-create' || this.source === 'qnrDetails' || this.source === 'onetime') {
      this.groupedQnr = this.commonService.groupBy(this.questions, 'sectionName');
    } else if (this.source === 'proLead') {
      this.groupedQnr = this.questions.reduce(function (rv: any, x: any) {
        (rv[x.question['sequnceId']] = rv[x.question['sequnceId']] || []).push(x);
        return rv;
      }, {});
    } else {
      this.groupedQnr = this.questions.reduce(function (rv: any, x: any) {
        (rv[x.question['sectionOrder']] = rv[x.question['sectionOrder']] || []).push(x);
        return rv;
      }, {});
    }
  }
  getAnswers(answerData: any, type?: any) {
    this.answers = new Object();
    for (let answ of answerData) {
      if (answ.answerLine) {
        this.answers[answ.answerLine.labelName] = answ.answerLine.answer[answ.question.fieldDataType];
      }
    }
  }
  getImg(url: any, file: any) {
    return this.fileService.getImage(url, file);
  }
  getQuestion(question: any) {
    if (this.source === 'customer-create' || this.source === 'qnrDetails' || this.source === 'onetime' || this.source === 'serviceOptionAppt') {
      return question;
    } else {
      return question.question;
    }
  }
  asIsOrder(a: any, b: any) {
    return 1;
  }
}
