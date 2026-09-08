import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ErrorMessagingService, StorageService } from 'jconsumer-shared';
import { ConsumerService } from 'jconsumer-shared';
import { QuestionaireService } from 'jconsumer-shared';

@Component({
  selector: 'app-onetime-questionnaire',
  templateUrl: './onetime-questionnaire.component.html',
  styleUrl: './onetime-questionnaire.component.css'
})
export class OnetimeQuestionnaireComponent implements OnInit {
  @Input() accountId; 
  questionaireValidated: boolean = false;
  onetimeQuestionnaireList: any; 
  oneTimeQNRLoaded: boolean = false;
  oneTimeQNRValidated: boolean = false;
  providerConsumerId: any;
  oneTimeInfo: any;
  isClickedOnce: boolean;
  oneTimeQnrEnabled: boolean = false;
  @Output() actionPerformed = new EventEmitter<any>();
  loading: boolean;
  constructor(
    private consumerService: ConsumerService,
    private questionaireService: QuestionaireService,
    // private snackbarService: SnackbarService,
    private errorService: ErrorMessagingService,
    private storageService: StorageService,

  ) {}

  ngOnInit() {
    this.loading = true;
    const _this = this;
    _this.storageService.getProviderConsumer().then((spConsumer: any) => {
      _this.providerConsumerId = spConsumer.id;
      _this.getOneTimeInfo(_this.providerConsumerId, _this.accountId).then(
        (questions: any) => {
          if (questions) {
            _this.onetimeQuestionnaireList = questions;
            console.log("_this.onetimeQuestionnaireList",_this.onetimeQuestionnaireList)
            if (questions?.labels?.[0]?.questions?.length > 0) {
              this.oneTimeQNRLoaded = true;
              this.oneTimeQNRValidated = false;
              console.log(this.oneTimeQNRLoaded,this.oneTimeQNRValidated)
            }
            else {
              _this.oneTimeQNRValidated = true;
              _this.actionPerformed.emit('success');
            }
            _this.loading = false;
          }
        }
      );
    })
  }
  getOneTimeInfo(providerConsumerID, accountId) {
    const _this = this;
    return new Promise(function (resolve, reject) {
      _this.consumerService.getProviderCustomerOnetimeInfo(
        providerConsumerID, accountId).subscribe(
          (questions) => {
            console.log("questions", questions)
            resolve(questions);
          }, () => {
            _this.questionaireValidated = true;
            resolve(false);
          });
    });
  }

  getOneTimeQuestionAnswers(event) {
    this.oneTimeInfo = event;
  }

  validateOneTimeInfo() {
    if (!this.oneTimeInfo) {
      this.oneTimeInfo = {
        answers: {
          answerLine: [],
          questionnaireId: this.onetimeQuestionnaireList.id
        }
      }
    }
    if (this.oneTimeInfo.answers) {
      const questions = this.oneTimeInfo.answers.answerLine.map(function (a) { return a.labelName; })
      const dataToSend: FormData = new FormData();
      const answer = new Blob([JSON.stringify(this.oneTimeInfo.answers)], { type: 'application/json' });
      const question = new Blob([JSON.stringify(questions)], { type: 'application/json' });
      dataToSend.append('answer', answer);
      dataToSend.append('question', question);
      this.consumerService.validateConsumerOneTimeQuestionnaire(dataToSend, this.accountId, this.providerConsumerId).subscribe((data: any) => {
        if (data.length === 0) {
          this.submitOneTimeInfo().then(
            (status) => {
              if (status) {
                this.oneTimeQNRValidated = true;
                this.actionPerformed.emit('success');              }
            })
        }
        this.questionaireService.sendMessage({ type: 'qnrValidateError', value: data });
      }, error => {
        let errorObj = this.errorService.getApiError(error);
        // this.snackbarService.openSnackBar(errorObj, { 'panelClass': 'snackbarerror' });
      });
    }
  }

  submitOneTimeInfo() {
    const _this = this;
    return new Promise(function (resolve, reject) {
      if (_this.onetimeQuestionnaireList && _this.onetimeQuestionnaireList.labels && _this.onetimeQuestionnaireList.labels.length > 0 && _this.onetimeQuestionnaireList.labels[0].questions.length > 0) {
        const dataToSend: FormData = new FormData();
        if (_this.oneTimeInfo.files) {
          for (const pic of _this.oneTimeInfo.files) {
            dataToSend.append('files', pic, pic['name']);
          }
        }
        const blobpost_Data = new Blob([JSON.stringify(_this.oneTimeInfo.answers)], { type: 'application/json' });
        dataToSend.append('question', blobpost_Data);
        _this.consumerService.submitCustomerOnetimeInfo(dataToSend, _this.providerConsumerId, _this.accountId).subscribe((data: any) => {
          // _this.showFamilyMember = false;
          resolve(true);
        }, error => {
          _this.isClickedOnce = false;
          let errorObj = _this.errorService.getApiError(error);
          // _this.snackbarService.openSnackBar(errorObj, { 'panelClass': 'snackbarerror' });
          resolve(false);
        });
      } else {
        resolve(true);
      }
    });
  }
}
