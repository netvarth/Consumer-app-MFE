import { Location } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { CommonService, DateTimeProcessor, ErrorMessagingService, FileService, JGalleryService, LocalStorageService, projectConstantsLocal, SharedService, ShowuploadfileComponent, ToastService, WordProcessor } from 'jconsumer-shared';
import { QuestionaireService } from '../questionaire-service';

@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.css']
})
export class QuestionnaireComponent implements OnInit, OnChanges {
  @Input() questionnaireList;
  @Input() source;
  @Input() accountId;
  @Input() questionAnswers;
  @Input() customerDetails;
  @Input() uuid;
  @Input() type;
  @Input() waitlistStatus;
  @Input() orderStatus;
  @Input() donationDetails;
  @Input() service;
  @Input() mode; // Added by mani to check the file upload
  @Output() fileChanged = new EventEmitter<any>();
  @Output() returnAnswers = new EventEmitter<any>();
  @Input() tempType;
  @Input() bookingType;
  answers: any = {};
  showDataGrid: any = {};
  selectedMessage: any = [];
  apiError: any = [];
  params;
  fileuploadpreAnswers: any = {};
  loading = false;
  buttonDisable = false;
  questions: any = [];
  selectedDocs: any = [];
  documentsToUpload: any = [];
  subscription: Subscription;
  uploadFilesTemp: any = [];
  filestoUpload: any = [];
  changeHappened = false;
  uploadedFiles: any = [];
  uploadedImages: any = [];
  bookingDetails: any = [];
  @ViewChild('logofile1') file2: ElementRef;
  image_list_popup;
  questionnaire_heading = '';
  customer_label = '';
  editQuestionnaire = false;
  audioVideoFiles: any = [];
  groupedQnr: any = [];
  dataGridColumns: any = {};
  dataGridColumnsAnswerList: any = [];
  updatedGridIndex = {};
  newTimeDateFormat = projectConstantsLocal.DATE_EE_MM_DD_YY_FORMAT;
  qnrStatus = '';
  comments = {};
  tday = new Date();
  minday = new Date(1900, 0, 1);
  dataGridListColumns: any = {};
  showqnr: boolean;
  item: any;
  showItem = false;
  totalPrice: any;
  itemLength: any;
  itemArray: any = [];
  dataGridList: any = [];
  id: number = 0;
  post_Data;
  dgList;
  sequenceId;
  finalObjectList: any = [];
  showservice = false;
  quesStore: any;
  allList: string;
  popSearches: any;
  serviceTotalPrice: number = 0;
  editableItem: any;
  customID: any;
  constructor(
    private activated_route: ActivatedRoute,
    private wordProcessor: WordProcessor,
    private lStorageService: LocalStorageService,
    private dateProcessor: DateTimeProcessor,
    public dialog: MatDialog,
    private fileService: FileService,
    private commonService: CommonService,
    private sharedService: SharedService,
    private galleryService: JGalleryService,
    private toastService: ToastService,
    private questionaireService: QuestionaireService,
    private errorService: ErrorMessagingService,
    private location: Location) {
    this.activated_route.queryParams.subscribe(qparams => {
      this.params = qparams;
      if (this.params.type) {
        this.source = this.params.type;
        console.log(this.source)
      }
      this.accountId = this.sharedService.getAccountID();
      this.customID = this.sharedService.getCustomID();
      // if (this.params.providerId) {
      //   this.accountId = this.params.providerId;
      // }
      if (this.params.uuid) {
        this.uuid = this.params.uuid;
      }
    });
    this.subscription = this.questionaireService.getMessage().subscribe(message => {
      switch (message.type) {
        case 'qnrValidateError':
          this.setValidateError(message.value);
          break;
      }
    });
  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  ngOnChanges() {
    if (this.questionAnswers && this.questionAnswers.filestoUpload && this.source === 'proLead') {
      this.filestoUpload = this.questionAnswers.filestoUpload;
    }

  }
  ngOnInit(): void {
    console.log("Service Details:", this.questionnaireList);
    console.log("Service Details:", this.service);
    if (this.lStorageService.getitemfromLocalStorage('itemArray')) {
      this.itemArray = this.lStorageService.getitemfromLocalStorage('itemArray');
      if (this.itemArray) {
        this.showItem = true;
        console.log("this.itemArray", this.itemArray)
      }
    }

    this.customer_label = this.wordProcessor.getTerminologyTerm('customer');

    if (this.questionnaireList) {
      console.log(this.source)
      if (this.source === 'customer-create' || this.source === 'onetime') {
        if (this.questionnaireList.labels && this.questionnaireList.labels.length > 0) {
          this.questions = this.questionnaireList.labels[0].questions;
          this.groupQuestionsBySection();
          // this.getAnswers(this.questions, 'get');
        }
        if (this.customerDetails && this.customerDetails[0] && this.customerDetails[0].questionnaire && this.customerDetails[0].questionnaire.questionAnswers) {
          this.getAnswers(this.customerDetails[0].questionnaire.questionAnswers, 'get');
        }
      } else if (this.source === 'qnrDetails') {
        this.questions = this.questionnaireList.questions;
        this.groupQuestionsBySection();
      } else if (this.source === 'serviceOptionAppt') {
        this.showservice = true;
        this.questions = this.questionnaireList.labels;
        this.groupQuestionsBySection();
      } else if (this.source === 'qnrpaper') {
        this.questions = this.questionnaireList[0].labels;
        this.groupQuestionsBySection();
      } else if (!this.uuid && this.questionnaireList.labels) {
        this.questions = this.questionnaireList.labels;
        this.groupQuestionsBySection();
      } else if (this.source === 'qnrView' && this.questionnaireList.labels) {
        this.questions = this.questionnaireList.labels;
        this.groupQuestionsBySection();
      }
      else if (this.source === 'condumerOrder' && this.questionnaireList.labels) {
        this.questions = this.questionnaireList.labels;
        this.groupQuestionsBySection();
      } else if (this.source === 'ivr' && this.questionnaireList && this.questionnaireList[0].labels) {
        this.questions = this.questionnaireList[0].labels;
        console.log("Questions:", this.questions);
        this.groupQuestionsBySection();
      }

    }
    if (this.source === 'customer-details' && this.customerDetails[0] && this.customerDetails[0].questionnaire) {
      this.questionnaireList = this.customerDetails[0].questionnaire;
      this.questions = this.customerDetails[0].questionnaire.questionAnswers;
      this.groupQuestionsBySection();
      this.getAnswers(this.questions, 'get');
    }
    if (this.questionAnswers) {
      if (this.questionAnswers.files) {
        this.selectedMessage = this.questionAnswers.files;
      }
      if (this.questionAnswers.audioVideo) {
        this.audioVideoFiles = this.questionAnswers.audioVideo;
      }
      if (this.questionAnswers.filestoUpload) {
        this.filestoUpload = this.questionAnswers.filestoUpload;
      }
      if (this.questionAnswers.dataGridColumnsAnswerList) {
        this.dataGridColumnsAnswerList = this.questionAnswers.dataGridColumnsAnswerList;
      }
      if (this.questionAnswers.comments) {
        this.comments = this.questionAnswers.comments;
      }
      if (this.questionAnswers.answers) {
        this.getAnswers(this.questionAnswers.answers.answerLine, 'init');
      }
      if (this.source == 'ivr') {
        this.getAnswers(this.questionAnswers, 'get');
      }
    }
    if (this.donationDetails && this.donationDetails.questionnaire) {
      this.questionnaireList = this.donationDetails.questionnaire;
      this.questions = this.questionnaireList.questionAnswers;
      this.groupQuestionsBySection();
      if (this.questions && this.questions.length > 0) {
        this.getAnswers(this.questions, 'get');
      }
    }

    if (this.uuid) {
      if (this.questionnaireList.questionAnswers) {
        this.questions = this.questionnaireList.questionAnswers;
        this.qnrStatus = 'submitted';
        this.groupQuestionsBySection();
      } else if (this.questionnaireList.labels) {
        this.questions = this.questionnaireList.labels;
        this.qnrStatus = 'released';
        this.groupQuestionsBySection();
      }
      else if (this.questionnaireList[0] && this.questionnaireList[0].labels) {
        this.questions = this.questionnaireList[0].labels;
        this.qnrStatus = 'released';
        this.groupQuestionsBySection();
      }
      if (this.questions && this.questions.length > 0) {
        this.getAnswers(this.questions, 'get');
      }
    }

    this.disableField()
  }

  getServiceOptionsSelected(item) {

  }
  //disable field
  disableField() {
    if (this.tempType && (this.tempType === 'Loan Sanction' || this.tempType === 'Rejected')) {
      this.buttonDisable = true;
      // this.disableInput();
    }
  }
  // *.component.ts
  asIsOrder(a, b) {
    return 1;
  }
  groupQuestionsBySection() {
    if (this.source === 'customer-create' || this.source === 'qnrDetails' || this.source === 'onetime') {
      this.groupedQnr = this.commonService.groupBy(this.questions, 'sectionName');
    }
    else if (this.source === 'proLead') {
      this.groupedQnr = this.questions.reduce(function (rv, x) {
        (rv[x.question['sequnceId']] = rv[x.question['sequnceId']] || []).push(x);
        return rv;
      }, {});
    }
    else {
      this.groupedQnr = this.questions.reduce(function (rv, x) {
        (rv[x.question['sectionOrder']] = rv[x.question['sectionOrder']] || []).push(x);
        return rv;
      }, {});
    }
  }
  setValidateError(errors) {
    this.apiError = [];
    if (errors.length > 0) {
      for (let error of errors) {
        this.apiError[error.questionField] = [];
        this.apiError[error.questionField].push(error.error);
      }
      this.buttonDisable = false;
    }
  }
  getAnswers(answerData, type?) {
    this.answers = new Object();
    this.dataGridColumns = {};
    if (type === 'get') {
      this.selectedMessage = [];
      this.uploadedImages = [];
      this.uploadedFiles = [];
      for (let answ of answerData) {

        if (answ.answerLine) {
          if (answ.question.fieldDataType === 'fileUpload') {

            if (this.source === 'proLead') {
              if (answ.answerLine.answer[answ.question.fieldDataType] && answ.answerLine.answer[answ.question.fieldDataType].length > 0) {
                for (let i = 0; i < answ.answerLine.answer[answ.question.fieldDataType].length; i++) {
                  answ.answerLine.answer[answ.question.fieldDataType][i].action = 'add';
                  answ.answerLine.answer[answ.question.fieldDataType][i].status = 'COMPLETE';
                  answ.answerLine.answer[answ.question.fieldDataType][i].s3path = answ.answerLine.answer[answ.question.fieldDataType][i].s3path;
                  answ.answerLine.answer[answ.question.fieldDataType][i].uid = answ.answerLine.answer[answ.question.fieldDataType][i].uid;
                  answ.answerLine.answer[answ.question.fieldDataType][i].driveId = answ.answerLine.answer[answ.question.fieldDataType][i].driveId;
                  answ.answerLine.answer[answ.question.fieldDataType][i].url = answ.answerLine.answer[answ.question.fieldDataType][i].keyName;
                }
                this.answers[answ.answerLine.labelName] = answ.answerLine.answer[answ.question.fieldDataType];
              }
            }

            if (answ.answerLine.answer && answ.answerLine.answer[answ.question.fieldDataType] && answ.answerLine.answer[answ.question.fieldDataType].length > 0) {
              for (let i = 0; i < answ.answerLine.answer[answ.question.fieldDataType].length; i++) {
                if (type === 'get') {
                  this.uploadedImages.push(answ.answerLine.answer[answ.question.fieldDataType][i]);
                  if (!this.uploadedFiles[answ.answerLine.labelName]) {
                    this.uploadedFiles[answ.answerLine.labelName] = {};
                  }
                  if (!this.uploadedFiles[answ.answerLine.labelName][answ.answerLine.answer[answ.question.fieldDataType][i].caption]) {
                    this.uploadedFiles[answ.answerLine.labelName][answ.answerLine.answer[answ.question.fieldDataType][i].caption] = {};
                  }
                  this.comments[answ.answerLine.labelName + '=' + answ.answerLine.answer[answ.question.fieldDataType][i].caption] = answ.answerLine.answer[answ.question.fieldDataType][i].comments;
                  this.uploadedFiles[answ.answerLine.labelName][answ.answerLine.answer[answ.question.fieldDataType][i].caption] = answ.answerLine.answer[answ.question.fieldDataType][i];


                } else {
                  this.selectedMessage.push(answ.answerLine.answer[answ.question.fieldDataType][i]);
                  if (!this.filestoUpload[answ.answerLine.labelName]) {
                    this.filestoUpload[answ.answerLine.labelName] = {};
                  }
                  if (!this.filestoUpload[answ.answerLine.labelName][answ.answerLine.answer[answ.question.fieldDataType][i].caption]) {
                    this.filestoUpload[answ.answerLine.labelName][answ.answerLine.answer[answ.question.fieldDataType][i].caption] = {};
                  }
                  this.filestoUpload[answ.answerLine.labelName][answ.answerLine.answer[answ.question.fieldDataType][i].caption] = answ.answerLine.answer[answ.question.fieldDataType][i];

                }
              }
            }
          } else if (answ.question.fieldDataType === 'dataGrid') {
            for (let row of answ.answerLine.answer[answ.question.fieldDataType]) {
              let columns = [];
              for (let i = 0; i < row.dataGridColumn.length; i++) {
                columns[i + 1] = row.dataGridColumn[i].column[Object.keys(row.dataGridColumn[i].column)[0]];
              }
              if (!this.dataGridColumnsAnswerList[answ.answerLine.labelName]) {
                this.dataGridColumnsAnswerList[answ.answerLine.labelName] = [];
              }
              this.dataGridColumnsAnswerList[answ.answerLine.labelName].push(columns);
            }
          } else {
            this.answers[answ.answerLine.labelName] = answ.answerLine.answer[answ.question.fieldDataType];
          }
        }
      }
    } else {
      for (let answ of answerData) {
        if (answ.answer[Object.keys(answ.answer)[0]]) {
          this.answers[answ.labelName] = answ.answer[Object.keys(answ.answer)[0]];
        }
      }
    }
    if (type === 'get') {
      Object.keys(this.uploadedFiles).forEach(key => {
        this.uploadFilesTemp[key] = [];
        Object.keys(this.uploadedFiles[key]).forEach(key1 => {
          if (this.uploadedFiles[key][key1]) {
            if (!this.uploadFilesTemp[key]) {
              this.uploadFilesTemp[key] = [];
            }
            const type = this.uploadedFiles[key][key1].type.split('/');

            if (type[0] !== 'audio' && type[0] !== 'video' || ((type[0] === 'audio' || type[0] === 'video') && this.uploadedFiles[key][key1].status === 'COMPLETE')) {
              this.uploadFilesTemp[key].push(key1);
            }
          }
        });
      });
    } else {
      Object.keys(this.filestoUpload).forEach(key => {
        Object.keys(this.filestoUpload[key]).forEach(key1 => {
          if (this.filestoUpload[key][key1]) {
            if (!this.uploadFilesTemp[key]) {
              this.uploadFilesTemp[key] = [];
            }
            this.uploadFilesTemp[key].push(key1);
          }
        });
      });
    }
    this.onSubmit('init');
  }
  filesSelected(event, question, document) {
    const input = event.target.files;
    if (input) {
      for (const file of input) {
        const fileInput = {
          caption: document,
          file: file,
          labelName: question.labelName
        }
        this.fileChanged.emit(fileInput);
        let type = file.type.split('/');

        this.apiError[question.labelName] = [];
        if (!this.filestoUpload[question.labelName]) {
          this.filestoUpload[question.labelName] = {};
        }
        if (!this.filestoUpload[question.labelName][document]) {
          this.filestoUpload[question.labelName][document] = {};
        }
        if (this.filestoUpload[question.labelName] && this.filestoUpload[question.labelName][document]) {
          let index;
          if (type[0] === 'application' || type[0] === 'image') {
            index = this.selectedMessage.indexOf(this.filestoUpload[question.labelName][document]);
          } else {
            index = this.audioVideoFiles.indexOf(this.filestoUpload[question.labelName][document]);
          }
          if (index !== -1) {
            if (type[0] === 'application' || type[0] === 'image') {
              this.selectedMessage.splice(index, 1);
            } else {
              this.audioVideoFiles.splice(index, 1);
            }
            delete this.filestoUpload[question.labelName][document];
            delete this.answers[question.labelName][index];
          }
        }
        this.filestoUpload[question.labelName][document] = file;
        if (type[0] === 'application' || type[0] === 'image') {
          this.selectedMessage.push(file);
          const indx = this.selectedMessage.indexOf(file);
          if (indx !== -1) {
            const reader = new FileReader();
            reader.onload = (e) => {
              this.selectedMessage[indx]['path'] = e.target['result'];
            };
            reader.readAsDataURL(file);
          }
        } else {
          this.audioVideoFiles.push(file);
          const indx = this.audioVideoFiles.indexOf(file);
          if (indx !== -1) {
            const reader = new FileReader();
            reader.onload = (e) => {
              this.audioVideoFiles[indx]['path'] = e.target['result'];
            };
            reader.readAsDataURL(file);
          }
        }
      }
      if (this.file2 && this.file2.nativeElement.value) {
        this.file2.nativeElement.value = '';
      }
      this.onSubmit('inputChange');
    }
  }
  changeImageSelected(question, document) {
    if (this.filestoUpload[question.labelName] && this.filestoUpload[question.labelName][document]) {
      let type = this.filestoUpload[question.labelName][document].type.split('/');
      type = type[0];
      let index;
      if (type === 'application' || type === 'image') {
        index = this.selectedMessage.indexOf(this.filestoUpload[question.labelName][document]);
      } else {
        index = this.audioVideoFiles.indexOf(this.filestoUpload[question.labelName][document]);
      }
      if (index !== -1) {
        if (type === 'application' || type === 'image') {
          this.selectedMessage.splice(index, 1);
        } else {
          this.audioVideoFiles.splice(index, 1);
        }
        delete this.filestoUpload[question.labelName][document];
        this.comments[question.labelName + '=' + document] = '';
        if (this.answers[question.labelName] && this.answers[question.labelName].length > 0) {
          const filteredAnswer = this.answers[question.labelName].filter(answer => answer.caption === document);
          if (filteredAnswer[0]) {
            const index = this.answers[question.labelName].indexOf(filteredAnswer[0]);
            if (index !== -1) {
              this.answers[question.labelName].splice(index, 1);
            }
          }
        }
      }
      if (Object.keys(this.filestoUpload[question.labelName]).length === 0) {
        delete this.filestoUpload[question.labelName];
      }
      if (this.answers[question.labelName] && this.answers[question.labelName].length === 0) {
        delete this.answers[question.labelName];
      }
    } else if (this.uploadedFiles[question.labelName] && this.uploadedFiles[question.labelName][document]) {
      const index = this.uploadedImages.indexOf(this.uploadedFiles[question.labelName][document]);
      if (index !== -1) {
        this.uploadedFiles[question.labelName][document] = 'remove';
        this.comments[question.labelName + '=' + document] = '';
      }
    }
    this.onSubmit('inputChange');
  }
  isNumeric(evt) {
    return this.commonService.isNumeric(evt);
  }
  onSubmit(keytype?) {

    Object.keys(this.filestoUpload).forEach(key => {
      if (!this.answers[key]) {
        this.answers[key] = [];
      }
      if (Object.keys(this.filestoUpload[key]).length > 0) {
        Object.keys(this.filestoUpload[key]).forEach(key1 => {
          if (this.filestoUpload[key][key1]) {
            let type = this.filestoUpload[key][key1].type.split('/');
            type = type[0];
            let indx;
            if (type === 'application' || type === 'image') {
              indx = this.selectedMessage.indexOf(this.filestoUpload[key][key1]);
            } else {
              indx = this.audioVideoFiles.indexOf(this.filestoUpload[key][key1]);
            }
            if (indx !== -1) {
              let status = 'add';
              if (this.uploadedFiles[key] && this.uploadedFiles[key][key1]) {
                status = 'update';
              }
              if (this.answers[key] && this.answers[key].length > 0) {
                const filteredAnswer = this.answers[key].filter(answer => answer.caption === key1);
                if (filteredAnswer[0]) {
                  const index = this.answers[key].indexOf(filteredAnswer[0]);
                  if (index !== -1) {
                    this.answers[key].splice(index, 1);
                  }
                }
              }
              let type = this.filestoUpload[key][key1].type.split('/');
              type = type[0];
              if (type === 'application' || type === 'image') {
                this.answers[key].push({ caption: key1, action: status, mimeType: this.filestoUpload[key][key1].type, url: this.filestoUpload[key][key1].name, size: this.filestoUpload[key][key1].size, comments: this.comments[key + '=' + key1], driveId: this.filestoUpload[key][key1].driveId, uid: this.filestoUpload[key][key1].uid, status: 'COMPLETE' });
              } else {
                this.answers[key].push({ caption: key1, action: status, mimeType: this.filestoUpload[key][key1].type, url: this.filestoUpload[key][key1].name, size: this.filestoUpload[key][key1].size, comments: this.comments[key + '=' + key1], driveId: this.filestoUpload[key][key1].driveId, uid: this.filestoUpload[key][key1].uid, status: 'COMPLETE' });
              }
            }
          } else {
            if (this.answers[key] && this.answers[key].length > 0) {
              const filteredAnswer = this.answers[key].filter(answer => answer.caption === key1);
              if (filteredAnswer[0]) {
                const index = this.answers[key].indexOf(filteredAnswer[0]);
                if (index !== -1) {
                  this.answers[key].splice(index, 1);
                }
              }
            }
          }
        });
      } else {
        delete this.answers[key];
      }
      if (this.answers[key] && this.answers[key].length === 0) {
        delete this.answers[key];
      }
    });

    Object.keys(this.uploadedFiles).forEach(key => {
      if (!this.answers[key]) {
        this.answers[key] = [];
      }
      if (this.uploadedFiles[key] && Object.keys(this.uploadedFiles[key]).length > 0) {
        Object.keys(this.uploadedFiles[key]).forEach(key1 => {
          if ((!this.filestoUpload[key] || (this.filestoUpload[key] && !this.filestoUpload[key][key1])) && this.uploadedFiles[key][key1] && this.uploadedFiles[key][key1] === 'remove') {
            if (this.answers[key] && this.answers[key].length > 0) {
              const filteredAnswer = this.answers[key].filter(answer => answer.caption === key1);
              if (filteredAnswer[0]) {
                const index = this.answers[key].indexOf(filteredAnswer[0]);
                if (index !== -1) {
                  this.answers[key].splice(index, 1);
                }
              }
            }
            this.answers[key].push({ caption: key1, action: 'remove' });
          }
        });
        if (this.answers[key].length === 0) {
          delete this.answers[key];
        }
      }
    });

    let data = [];
    Object.keys(this.dataGridColumnsAnswerList).forEach(key => {
      let newFiled = {};
      let question = this.questions.filter(quest => this.getQuestion(quest).labelName === key);
      question = question[0].question;
      for (let gridAnswer of this.dataGridColumnsAnswerList[key]) {
        let columnData = [];
        Object.keys(gridAnswer).forEach(key1 => {
          let newType = {};
          const columnDetails = question.dataGridProperties.dataGridColumns.filter(clmn => clmn.order === JSON.parse(key1));
          if (columnDetails[0]) {
            const columnType = columnDetails[0].dataType;
            newType[columnType] = gridAnswer[key1];
            columnData.push({
              columnId: columnDetails[0].columnId,
              column: newType
            });
          }
        });
        let newMap = {};
        newMap['dataGridColumn'] = columnData;
        if (!newFiled[question.fieldDataType]) {
          newFiled[question.fieldDataType] = [];
        }
        newFiled[question.fieldDataType].push(newMap);
      }
      data.push({
        'labelName': key,
        'answer': newFiled
      });
    });

    Object.keys(this.answers).forEach(key => {

      this.apiError[key] = [];
      let newMap = {};
      let question = this.questions.filter(quest => this.getQuestion(quest).labelName === key);
      if (this.source === 'customer-create' || this.source === 'qnrDetails' || this.source === 'onetime') {
        question = question[0];
      } else {
        question = question[0].question;
      }
      if (this.answers[key] || question.fieldDataType === 'bool') {
        let answer = this.answers[key];
        if (question.fieldDataType === 'date') {
          answer = this.dateProcessor.transformToYMDFormat(answer);
        }
        newMap[question.fieldDataType] = answer;
        data.push({
          'labelName': key,
          'answer': newMap
        });
      } else {
        // newMap = '';
        // data.push({
        // 'labelName': key,
        // });
      }
    });
    let postData;
    if (this.source === 'qnrpaper') {
      postData = {
        'questionnaireId': (this.questionnaireList[0].id) ? this.questionnaireList[0].id : this.questionnaireList[0].questionnaireId,
        'answerLine': data
      }
    }
    else if (keytype === 'serviceOption') {
      postData = {
        'questionnaireId': (this.questionnaireList.id) ? this.questionnaireList.id : this.questionnaireList[0].questionnaireId,
        'answerLine': this.finalObjectList
      }
    }
    else if (this.source === 'ivr' && this.customID) {
      console.log('fffffffffffffffffffff', this.questionnaireList)
      postData = {
        'questionnaireId': (this.questionnaireList[0].id) ? this.questionnaireList[0].id : this.questionnaireList[0].questionnaireId,
        'answerLine': data
      }
    }
    else {
      console.log('questionnaireList', this.questionnaireList)
      postData = {
        'questionnaireId': (this.questionnaireList.id) ? this.questionnaireList.id : this.questionnaireList.questionnaireId,
        'answerLine': data
      }
    }
    const passData = { 'answers': postData, 'files': this.selectedMessage, 'audioVideo': this.audioVideoFiles, 'filestoUpload': this.filestoUpload, 'dataGridColumnsAnswerList': this.dataGridColumnsAnswerList, 'comments': this.comments };
    if (keytype === 'inputChange') {
      this.changeHappened = true;
    }
    if (keytype === 'submit') {
      if (this.changeHappened) {
        this.submitQuestionnaire(passData);
      } else {
        if (!this.type) {
          this.location.back();
        } else {
          if (this.type === 'qnr-link') {
            this.returnAnswers.emit('nochange');
          } else {
            this.editQnr();
          }
        }
      }
    } else {

      this.returnAnswers.emit(passData);
    }
  }
  getDate(date) {
    return new Date(date);
  }
  listChange(ev, value, question, column?) {
    if (question.fieldDataType !== 'dataGrid') {
      if (ev.target.checked) {
        if (!this.answers[question.labelName]) {
          this.answers[question.labelName] = [];
        }
        if (question.listPropertie && question.listPropertie.maxAnswers && question.listPropertie.maxAnswers > 1) {
          this.answers[question.labelName].push(value);
        } else {
          this.answers[question.labelName][0] = value;
        }
      } else {
        const indx = this.answers[question.labelName].indexOf(value);
        this.answers[question.labelName].splice(indx, 1);
      }
      if (this.answers[question.labelName].length === 0) {
        this.answers[question.labelName] = '';
      }
    } else {
      if (ev.target.checked) {
        if (!this.dataGridColumns[question.labelName + '=' + column.order]) {
          this.dataGridColumns[question.labelName + '=' + column.order] = [];
        }
        this.dataGridColumns[question.labelName + '=' + column.order].push(value);
      } else {
        const indx = this.dataGridColumns[question.labelName + '=' + column.order].indexOf(value);
        this.dataGridColumns[question.labelName + '=' + column.order].splice(indx, 1);
      }
    }
    this.onSubmit('inputChange');
  }
  isChecked(value, question, column?) {
    if (question.fieldDataType !== 'dataGrid') {
      if (this.answers[question.labelName]) {
        const indx = this.answers[question.labelName].indexOf(value);
        if (indx !== -1) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      if (this.dataGridColumns[question.labelName + '=' + column.order]) {
        const indx = this.dataGridColumns[question.labelName + '=' + column.order].indexOf(value);
        if (indx !== -1) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
  }
  booleanChange(ev, value, question, column?) {
    if (question.fieldDataType !== 'dataGrid') {
      if (ev.target.checked) {
        if (!this.answers[question.labelName]) {
          this.answers[question.labelName] = {};
        }
        this.answers[question.labelName] = (value.toLowerCase() === 'yes') ? true : false;
      }
    } else {
      if (ev.target.checked) {
        this.dataGridColumns[question.labelName + '=' + column.order] = (value === 'yes') ? true : false;
      }
    }
    this.onSubmit('inputChange');
  }
  isBooleanChecked(value, question, column?) {
    value = (value.toLowerCase() === 'yes') ? true : false;
    if (question.fieldDataType !== 'dataGrid') {
      if (this.answers[question.labelName] !== '' && typeof this.answers[question.labelName] === 'string') {
        this.answers[question.labelName] = JSON.parse(this.answers[question.labelName])
      }
      if (this.answers[question.labelName] === value) {
        return true;
      } else {
        return false;
      }
    } else {
      if (this.dataGridColumns[question.labelName + '=' + column.order] !== '' && typeof this.dataGridColumns[question.labelName + '=' + column.order] === 'string') {
        this.dataGridColumns[question.labelName + '=' + column.order] = JSON.parse(this.dataGridColumns[question.labelName + '=' + column.order])
      }
      if (this.dataGridColumns[question.labelName + '=' + column.order] === value) {
        return true;
      } else {
        return false;
      }
    }
  }
  submitQuestionnaire(passData) {
    console.log('fdff', passData)
    const dataToSend: FormData = new FormData();
    const blobpost_Data = new Blob([JSON.stringify(passData.answers)], { type: 'application/json' });
    dataToSend.append('question', blobpost_Data);
    this.buttonDisable = true;
    if (this.source === 'consCheckin' || this.source === 'consAppt' || this.source === 'consOrder' || this.source === 'consDonationDetails') {
      this.validateConsumerQuestionnaireResubmit(passData.answers, dataToSend);
    }
    else if (this.source === 'ivr' && this.customID) {

      this.validateConsumerIvrQuestionnaire(passData.answers, this.bookingType);
    }
    else {
      this.validateProviderQuestionnaireResubmit(passData.answers, dataToSend);
    }
  }
  updateConsumerQnr(dataToSend) {
    this.questionaireService.resubmitProviderCustomerQuestionnaire(this.customerDetails[0].id, dataToSend).subscribe(data => {
      this.editQnr();
      this.toastService.showSuccess('Updated Successfully');
      this.buttonDisable = false;
    }, error => {
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
      this.buttonDisable = false;
    });
  }
  resubmitConsumerWaitlistQuestionnaire(body) {
    this.questionaireService.resubmitConsumerWaitlistQuestionnaire(body, this.uuid, this.accountId).subscribe(data => {
      this.uploadAudioVideo(data, 'consCheckin');
    }, error => {
      this.buttonDisable = false;
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
    });
  }
  submitConsumerWaitlistQuestionnaire(body) {
    this.questionaireService.submitConsumerWaitlistQuestionnaire(body, this.uuid, this.accountId).subscribe(data => {
      this.uploadAudioVideo(data, 'consCheckin');
    }, error => {
      this.buttonDisable = false;
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
    });
  }
  submitConsumerDonationQuestionnaire(body) {
    this.questionaireService.submitConsumerWaitlistQuestionnaire(body, this.uuid, this.accountId).subscribe(data => {
      this.uploadAudioVideo(data, 'consDonationDetails');
    }, error => {
      this.buttonDisable = false;
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
    });
  }
  resubmitConsumerDonationQuestionnaire(body) {
    this.questionaireService.resubmitConsumerDonationQuestionnaire(body, this.uuid, this.accountId).subscribe(data => {
      this.uploadAudioVideo(data, 'consDonationDetails');
    }, error => {
      this.buttonDisable = false;
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
    });
  }
  resubmitConsumerApptQuestionnaire(body) {
    this.questionaireService.resubmitConsumerApptQuestionnaire(body, this.uuid, this.accountId).subscribe(data => {
      this.uploadAudioVideo(data, 'consAppt');
    }, error => {
      this.buttonDisable = false;
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
    });
  }
  submitConsumerApptQuestionnaire(body) {
    this.questionaireService.submitConsumerApptQuestionnaire(body, this.uuid, this.accountId).subscribe(data => {
      this.uploadAudioVideo(data, 'consAppt');
    }, error => {
      this.buttonDisable = false;
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
    });
  }
  resubmitConsumerOrderQuestionnaire(body) {
    this.questionaireService.resubmitConsumerOrderQuestionnaire(body, this.uuid, this.accountId).subscribe(data => {
      if (this.source === 'paper') {
        this.uploadAudioVideo(data, 'paper');
      }
      else {
        this.uploadAudioVideo(data, 'consOrder');
      }
    }, error => {
      this.buttonDisable = false;
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
    });
  }
  submitConsumerOrderQuestionnaire(body) {
    this.questionaireService.submitConsumerOrderQuestionnaire(body, this.uuid, this.accountId).subscribe(data => {
      if (this.source === 'paper') {
        this.uploadAudioVideo(data, 'paper');
      }
      else {
        this.uploadAudioVideo(data, 'consOrder');
      }
    }, error => {
      this.buttonDisable = false;
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
    });
  }
  resubmitProviderWaitlistQuestionnaire(body) {
    this.questionaireService.resubmitProviderWaitlistQuestionnaire(body, this.uuid).subscribe(data => {
      this.uploadAudioVideo(data, 'proCheckin');
    }, error => {
      this.buttonDisable = false;
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
    });
  }
  submitProviderWaitlistQuestionnaire(body) {
    this.questionaireService.submitProviderWaitlistQuestionnaire(body, this.uuid).subscribe(data => {
      this.uploadAudioVideo(data, 'proCheckin');
    }, error => {
      this.buttonDisable = false;
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
    });
  }
  resubmitProviderApptQuestionnaire(body) {
    this.questionaireService.resubmitProviderApptQuestionnaire(body, this.uuid).subscribe(data => {
      this.uploadAudioVideo(data, 'proAppt');
    }, error => {
      this.buttonDisable = false;
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
    });
  }
  submitProviderApptQuestionnaire(body) {
    this.questionaireService.submitProviderApptQuestionnaire(body, this.uuid).subscribe(data => {
      this.uploadAudioVideo(data, 'proAppt');
    }, error => {
      this.buttonDisable = false;
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
    });
  }
  resubmitProviderOrderQuestionnaire(body) {
    this.questionaireService.resubmitProviderOrderQuestionnaire(body, this.uuid).subscribe(data => {
      this.uploadAudioVideo(data, 'proOrder');
    }, error => {
      this.buttonDisable = false;
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
    });
  }
  submitProviderOrderQuestionnaire(body) {
    this.questionaireService.submitProviderOrderQuestionnaire(body, this.uuid).subscribe(data => {
      this.uploadAudioVideo(data, 'proOrder');
    }, error => {
      this.buttonDisable = false;
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
    });
  }
  resubmitDonationQuestionnaire(body) {
    this.questionaireService.resubmitProviderDonationQuestionnaire(this.donationDetails.uid, body).subscribe(data => {
      this.successGoback();
    }, error => {
      this.buttonDisable = false;
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
    });
  }
  submitDonationQuestionnaire(body) {
    this.questionaireService.submitDonationQuestionnaire(this.donationDetails.uid, body, this.accountId).subscribe(data => {
      this.editQnr();
      this.toastService.showSuccess('Updated Successfully');
      this.buttonDisable = false;
    }, error => {
      this.buttonDisable = false;
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
    });
  }
  uploadAudioVideo(data, type) {
    if (data.urls && data.urls.length > 0) {
      let postData = {
        urls: []
      };
      for (const url of data.urls) {
        const file = this.filestoUpload[url.labelName][url.document];
        this.questionaireService.videoaudioS3Upload(file, url.url)
          .subscribe(() => {
            postData['urls'].push({ uid: url.uid, labelName: url.labelName });
            if (data.urls.length === postData['urls'].length) {
              if (type === 'consCheckin') {
                this.questionaireService.consumerWaitlistQnrUploadStatusUpdate(this.uuid, this.accountId, postData)
                  .subscribe((data) => {
                    this.successGoback();
                  },
                    error => {
                      let errorObj = this.errorService.getApiError(error);
                      this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
                      this.buttonDisable = false;
                    });
              } else if (type === 'consAppt') {
                this.questionaireService.consumerApptQnrUploadStatusUpdate(this.uuid, this.accountId, postData)
                  .subscribe((data) => {
                    this.successGoback();
                  },
                    error => {
                      let errorObj = this.errorService.getApiError(error);
                      this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
                      this.buttonDisable = false;
                    });
              } else if (type === 'consOrder' || type === 'paper') {
                this.questionaireService.consumerOrderQnrUploadStatusUpdate(this.uuid, this.accountId, postData)
                  .subscribe((data) => {
                    this.successGoback();
                  },
                    error => {
                      let errorObj = this.errorService.getApiError(error);
                      this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
                      this.buttonDisable = false;
                    });
              } else if (type === 'consDonationDetails') {
                this.questionaireService.consumerDonationQnrUploadStatusUpdate(this.uuid, this.accountId, postData)
                  .subscribe((data) => {
                    this.successGoback();
                  },
                    error => {
                      let errorObj = this.errorService.getApiError(error);
                      this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
                      this.buttonDisable = false;
                    });
              } else if (type === 'proCheckin') {
                this.questionaireService.providerWaitlistQnrUploadStatusUpdate(this.uuid, postData)
                  .subscribe((data) => {
                    this.successGoback();
                  },
                    error => {
                      let errorObj = this.errorService.getApiError(error);
                      this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
                      this.buttonDisable = false;
                    });
              } else if (type === 'proOrder') {
                this.questionaireService.providerOrderQnrUploadStatusUpdate(this.uuid, postData)
                  .subscribe((data) => {
                    this.successGoback();
                  },
                    error => {
                      let errorObj = this.errorService.getApiError(error);
                      this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
                      this.buttonDisable = false;
                    });
              } else {
                this.questionaireService.providerApptQnrUploadStatusUpdate(this.uuid, postData)
                  .subscribe((data) => {
                    this.successGoback();
                  },
                    error => {
                      let errorObj = this.errorService.getApiError(error);
                      this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
                      this.buttonDisable = false;
                    });
              }
            }
          },
            error => {
              let errorObj = this.errorService.getApiError(error);
              this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
              this.buttonDisable = false;
            });
      }
    } else {
      this.successGoback();
    }
  }
  goBack() {
    this.location.back();
  }
  getQuestion(question) {
    if (this.source === 'customer-create' || this.source === 'qnrDetails' || this.source === 'onetime' || this.source === 'serviceOptionAppt') {
      return question;
    } else {
      return question.question;
    }
  }
  validateQuestionnaire(src?) {
    if (!this.questionAnswers) {
      this.questionAnswers = {
        answers: {
          answerLine: [],
          questionnaireId: (this.questionnaireList.id) ? this.questionnaireList.id : this.questionnaireList.questionnaireId,
        }
      }
    }
  }
  validateConsumerIvrQuestionnaire(answers, bookingType) {
    this.questionaireService.validateConsumerIvrQuestionnaire(answers, bookingType).subscribe((data: any) => {
      this.toastService.showSuccess("Details Saved Successfully");

    }, (error) => {
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
    });
  }
  validateProviderQuestionnaireResubmit(answers, dataToSend) {
    this.questionaireService.validateProviderQuestionnaireResbmit(answers).subscribe((data: any) => {
      this.setValidateError(data);
      if (data.length === 0) {
        if (this.source === 'customer-details') {
          this.updateConsumerQnr(dataToSend);
        } else if (this.source === 'proDonation') {
          this.resubmitDonationQuestionnaire(dataToSend);
        } else if (this.source === 'proCheckin') {
          if (this.qnrStatus === 'submitted') {
            this.resubmitProviderWaitlistQuestionnaire(dataToSend);
          } else {
            this.submitProviderWaitlistQuestionnaire(dataToSend);
          }
        } else if (this.source === 'proOrder') {
          if (this.qnrStatus === 'submitted') {
            this.resubmitProviderOrderQuestionnaire(dataToSend);
          } else {
            this.submitProviderOrderQuestionnaire(dataToSend);
          }
        } else {
          if (this.qnrStatus === 'submitted') {
            this.resubmitProviderApptQuestionnaire(dataToSend);
          } else {
            this.submitProviderApptQuestionnaire(dataToSend);
          }
        }
      }
    }, error => {
      this.buttonDisable = false;
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
    });
  }
  validateConsumerQuestionnaireResubmit(answers, dataToSend) {
    this.questionaireService.validateConsumerQuestionnaireResbumit(answers, this.accountId).subscribe((data: any) => {
      this.setValidateError(data);
      if (data.length === 0) {
        if (this.source === 'consCheckin') {
          if (this.qnrStatus === 'submitted') {
            this.resubmitConsumerWaitlistQuestionnaire(dataToSend);
          } else {
            this.submitConsumerWaitlistQuestionnaire(dataToSend);
          }
        } else if (this.source === 'consAppt') {
          if (this.qnrStatus === 'submitted') {
            this.resubmitConsumerApptQuestionnaire(dataToSend);
          } else {
            this.submitConsumerApptQuestionnaire(dataToSend);
          }
        } else if (this.source === 'consOrder' || this.source === 'paper') {
          if (this.qnrStatus === 'submitted') {
            this.resubmitConsumerOrderQuestionnaire(dataToSend);
          } else {
            this.submitConsumerOrderQuestionnaire(dataToSend);
          }
        } else {
          if (this.qnrStatus === 'submitted') {
            this.resubmitConsumerDonationQuestionnaire(dataToSend);
          } else {
            this.submitConsumerDonationQuestionnaire(dataToSend);
          }
        }
      }
    }, error => {
      this.buttonDisable = false;
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
    });
  }

  getImg(question, document) {
    if (this.filestoUpload[question.labelName] && this.filestoUpload[question.labelName][document]) {
      let type = this.filestoUpload[question.labelName][document].type.split('/');
      let file;
      if (type[0] === 'video' || type[0] === 'audio') {
        file = this.audioVideoFiles;
      } else {
        file = this.selectedMessage;
      }
      const indx = file.indexOf(this.filestoUpload[question.labelName][document]);
      if (indx !== -1) {
        let path = this.fileService.getImage(null, this.filestoUpload[question.labelName][document]);

        if (path && path !== null) {
          return path;
        }
        path = file[indx].path;
        return path;
      }
    } else if (this.uploadedFiles[question.labelName] && this.uploadedFiles[question.labelName][document]) {
      const indx = this.uploadedImages.indexOf(this.uploadedFiles[question.labelName][document]);
      if (indx !== -1) {
        let path = this.fileService.getImage(null, this.uploadedImages[indx]);
        if (path && path !== null) {
          return path;
        }
        path = this.uploadedImages[indx].s3path;
        return path;
      }
    }
  }
  disableInput() {
    if (this.uuid) {
      if (this.source === 'consCheckin' || this.source === 'proCheckin') {
        if (this.waitlistStatus !== 'checkedIn' && this.waitlistStatus !== 'arrived' && this.waitlistStatus !== 'done' && this.waitlistStatus !== 'started' && this.waitlistStatus !== 'cancelled') {
          return true;
        }
      }
      if (this.source === 'consAppt' || this.source === 'proAppt') {
        if (this.waitlistStatus !== 'Confirmed' && this.waitlistStatus !== 'Arrived' && this.waitlistStatus !== 'Started' && this.waitlistStatus !== 'Completed' && this.waitlistStatus !== 'Cancelled') {
          return true;
        }
      }
      if (this.source === 'consOrder' || this.source === 'proOrder' || this.source === 'paper') {
        if (this.waitlistStatus !== 'Order Confirmed' && this.waitlistStatus !== 'Order Received') {
          return true;
        }
      }
    }
    if (this.source === 'consDonationDetails' || this.source === 'qnrDetails' || this.source === 'qnrView' || (this.type && this.type !== 'qnr-link' && !this.editQuestionnaire)) {
      return true;
    }
    return false;
  }
  showEditBtn() {
    if (this.type && this.type !== 'qnr-link') {
      if (this.source === 'consCheckin' || this.source === 'proCheckin') {
        if (this.waitlistStatus !== 'checkedIn' && this.waitlistStatus !== 'arrived') {
          return false;
        }
      }
      if (this.source === 'consAppt' || this.source === 'proAppt') {
        if (this.waitlistStatus !== 'Confirmed' && this.waitlistStatus !== 'Arrived') {
          return false;
        }
      }
      if (this.source === 'consOrder' || this.source === 'proOrder' || this.source === 'paper') {
        if (this.waitlistStatus !== 'Order Confirmed' && this.waitlistStatus !== 'Order Received') {
          return false;
        }

      }
      if (this.source === 'consDonationDetails' || this.source === 'qnrDetails' || this.source === 'qnrView' || (this.type && this.type !== 'qnr-link' && !this.editQuestionnaire)) {
        return false;
      }
      return true;
    }
    return true;
  }
  openAttachmentGallery(question, document) {
    this.image_list_popup = [];
    let count = 0;
    let imagePath;
    let caption = '';
    if (this.filestoUpload[question.labelName] && this.filestoUpload[question.labelName][document]) {
      let type = this.filestoUpload[question.labelName][document].type.split('/');
      if (type[0] === 'video' || type[0] === 'audio') {
        const indx = this.audioVideoFiles.indexOf(this.filestoUpload[question.labelName][document]);
        this.showAudioVideoFile(this.audioVideoFiles[indx]);
      } else {
        const indx = this.selectedMessage.indexOf(this.filestoUpload[question.labelName][document]);
        if (indx !== -1) {
          if (type[1] === 'pdf' || type[1] === 'docx' || type[1] === 'txt' || type[1] === 'doc') {
            if (this.selectedMessage[indx].s3path) {
              window.open(this.selectedMessage[indx].s3path, '_blank');
            } else {
              window.open(this.selectedMessage[indx].path, '_blank');
            }
          } else {
            imagePath = this.uploadedImages[indx].path;
            caption = this.comments[question.labelName + '=' + document];
          }
        }
      }
    } else if (this.uploadedFiles[question.labelName] && this.uploadedFiles[question.labelName][document]) {
      const indx = this.uploadedImages.indexOf(this.uploadedFiles[question.labelName][document]);
      let type = this.uploadedFiles[question.labelName][document].type.split('/');
      let ext = type[1];
      type = type[0];
      if (indx !== -1) {
        if (type === 'video' || type === 'audio') {
          this.showAudioVideoFile(this.uploadedImages[indx]);
        } else if (ext === 'pdf' || ext === 'docx' || ext === 'txt' || ext === 'doc' || ext === 'vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
          window.open(this.uploadedFiles[question.labelName][document].s3path, '_blank');
        } else {
          // console.log('typetxt2',this.uploadedImages[indx]);
          if (this.uploadedImages && this.uploadedImages[indx] && this.uploadedImages[indx]['keyName'] &&
            this.uploadedImages[indx]['keyName'].includes('docx')) {
            window.open(this.uploadedFiles[question.labelName][document].s3path, '_blank');
          }
          else {
            imagePath = this.uploadedImages[indx].s3path;
            caption = this.uploadedImages[indx].comments;
          }

        }
      }
    }
    if (imagePath) {
      const imgobj = {
        src: imagePath,
        thumb: imagePath,
        alt: caption
      }
      this.image_list_popup.push(imgobj);
      count++;
    }
    if (count > 0) {
      setTimeout(() => {
        this.openGallery(this.image_list_popup[0]);
      }, 200);
    }
  }
  openGallery(image): void {
    let imageIndex = this.getCurrentIndexCustomLayout(image, this.image_list_popup);
    this.galleryService.open(this.image_list_popup, imageIndex);
  }
  private getCurrentIndexCustomLayout(image, images): number {
    return image ? images.indexOf(image) : -1;
  }

  showAudioVideoFile(file) {
    const fileviewdialogRef = this.dialog.open(ShowuploadfileComponent, {
      width: '50%',
      panelClass: ['popup-class', 'commonpopupmainclass', 'uploadfilecomponentclass'],
      disableClose: true,
      data: {
        file: file,
        source: 'qnr'
      }
    });
    fileviewdialogRef.afterClosed().subscribe(result => {
    });
  }
  editQnr() {
    this.editQuestionnaire = !this.editQuestionnaire;
  }
  getDocuments(question) {
    if (question.filePropertie.maxNoOfFile > 1 && question.filePropertie.minNoOfFile !== question.filePropertie.maxNoOfFile) {
      return this.uploadFilesTemp[question.labelName];
    } else {
      return question.filePropertie.allowedDocuments;
    }
  }
  showProviderText(question) {
    if (question.whoCanAnswer && question.whoCanAnswer === 'PROVIDER_ONLY') {
      return true;
    }
    return false;
  }
  successGoback() {
    this.buttonDisable = false;
    if (!this.type) {
      this.location.back();
    } else {
      this.filestoUpload = [];
      this.editQnr();
      this.returnAnswers.emit('reload');
      if (this.type !== 'qnr-link') {
        this.toastService.showSuccess('Updated Successfully');
      }
    }
  }
  showDataGridAddSection(question, value) {
    this.showDataGrid[question.labelName] = value;
    this.updatedGridIndex[question.labelName] = null;
  }
  showDataGridAddSectionn(question, value) {
    this.quesStore = question;
    this.lStorageService.setitemonLocalStorage('quesStore', this.quesStore);
    this.showDataGrid[question.labelName] = value;
    this.updatedGridIndex[question.labelName] = null;
  }
  saveDataGridColumn(question) {
    let columns = [];
    for (let column of question.dataGridProperties.dataGridColumns) {
      if (this.dataGridColumns[question.labelName + '=' + column.order] || column.dataType === 'bool') {
        columns[column.order] = this.dataGridColumns[question.labelName + '=' + column.order];
      } else {
        if (column.dataType === 'list' || column.dataType === 'fileUpload') {
          columns[column.order] = [];
        } else {
          columns[column.order] = '';
        }
      }
    }
    if (!this.dataGridColumnsAnswerList[question.labelName]) {
      this.dataGridColumnsAnswerList[question.labelName] = [];
    }
    if (this.updatedGridIndex[question.labelName] !== null) {
      this.dataGridColumnsAnswerList[question.labelName][this.updatedGridIndex[question.labelName]] = columns;
    } else {
      this.dataGridColumnsAnswerList[question.labelName].push(columns);
    }
    this.cancelAddorUpdate(question);
    this.onSubmit('inputChange');
  }
  editDataGrid(question, column) {
    const index = this.dataGridColumnsAnswerList[question.labelName].indexOf(column);
    Object.keys(column).forEach(key => {
      this.dataGridColumns[question.labelName + '=' + key] = column[key];
    });
    this.updatedGridIndex[question.labelName] = index;
    this.showDataGrid[question.labelName] = true;
  }
  deleteDataGrid(question, column) {
    const index = this.dataGridColumnsAnswerList[question.labelName].indexOf(column);
    this.dataGridColumnsAnswerList[question.labelName].splice(index, 1);
    this.onSubmit('inputChange');
  }
  cancelAddorUpdate(question) {
    this.showDataGrid[question.labelName] = false;
    this.updatedGridIndex[question.labelName] = null;
    for (let column of question.dataGridProperties.dataGridColumns) {
      this.dataGridColumns[question.labelName + '=' + column.order] = '';
    }
  }
  getColumnType(columns, column) {
    const columnDetails = columns.filter(clmn => clmn.order === JSON.parse(column));
    if (columnDetails[0]) {
      return columnDetails[0].dataType;
    }
  }
  getSectionCount() {
    return Object.keys(this.groupedQnr).length;
  }
  getBoolValue(value) {
    value = (value !== '' && typeof value === 'string') ? JSON.parse(value) : value;
    if (value === true) {
      return 'Yes';
    }
    if (value === false) {
      return 'No';
    }
    return ''
  }
  getMaxdate(data) {
    let date;
    if (this.getQuestion(data).dateProperties && this.getQuestion(data).dateProperties.endDate) {
      const dt = this.reverse(this.getQuestion(data).dateProperties.endDate);
      date = new Date(dt)
    } else {
      date = this.tday;
    }
    return date;
  }
  getMindate(data) {
    let date;
    if (this.getQuestion(data).dateProperties && this.getQuestion(data).dateProperties.startDate) {
      const dt = this.reverse(this.getQuestion(data).dateProperties.startDate);
      date = new Date(dt)
    } else {
      date = this.minday;
    }

    return date;
  }
  reverse(s) {
    return s.split("-").reverse().join("-");
  }

  getItemQuantity(item) {
    let quantity = item.columnItem[0].answer.dataGridList[0].dataGridListColumn[0].quantity;
    return quantity
    // console.log("item", item)
  }
  decrement(removingItem) {
    let index = this.itemArray.findIndex(x => x.id === removingItem.id)
    if (index > -1) {
      console.log("this.itemArray[index]", this.itemArray[index])
      if (this.getItemQuantity(this.itemArray[index]) == 1) {
        this.itemArray.splice(index, 1); // 2nd parameter means remove one item only
      }
      else {
        let items = this.itemArray[index].columnItem[0].answer.dataGridList[0].dataGridListColumn;
        for (let i = 0; i < items.length; i++) {
          items[i].quantity = items[i].quantity - 1;
        }
      }
      if (this.itemArray) {
        this.lStorageService.setitemonLocalStorage('itemArray', this.itemArray);
      }
      this.serviceTotalPrice = 0;
      this.itemArray.forEach((item: any) => {
        this.serviceTotalPrice = this.serviceTotalPrice + item.price;
      });

      this.lStorageService.setitemonLocalStorage('serviceTotalPrice', this.serviceTotalPrice);
      this.finalObjectList.splice(index, 1);
    }
    this.onSubmit('serviceOption')
  }
}
