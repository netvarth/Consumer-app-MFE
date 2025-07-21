import { Component, HostListener, OnInit } from '@angular/core';
import { DateTimeProcessor } from 'jaldee-framework/calendar/date-time';
import { ErrorMessagingService } from 'jaldee-framework/error-messaging';
import { FileService } from 'jaldee-framework/file';
import { QuestionaireService } from 'jaldee-framework/questionaire';
import { SharedService } from 'jaldee-framework/shared';
import { SnackbarService } from 'jaldee-framework/snackbar';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-item-options',
  templateUrl: './item-options.component.html',
  styleUrls: ['./item-options.component.css']
})
export class ItemOptionsComponent implements OnInit {
  itemData: any;
  questions: any;
  labels: any;
  timeType: any = 1;
  questionsLength: any;
  selectedCategory: any;
  answers: any = {};
  basePriceList: any;
  priceGridList: any;
  totalPrice: any;
  itemTotal;
  itemPrice: any;
  qnrId: any;
  selectedFiles = {};
  questionnaireAnswers: any = [];
  filesToUpload: any = [];
  boolTypeValues: any = [
    {
      "name": "Yes",
      "value": true
    },
    {
      "name": "No",
      "value": false
    }
  ];
  itemOptionsData: any;
  type: any;
  itemDetails: any;
  lastCustomization: any;
  account_id: any;
  moment: any;
  constructor(
    private itemOptionsRef: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private sharedService: SharedService,
    private snackbarService: SnackbarService,
    private fileService: FileService,
    private questionaireService: QuestionaireService,
    private dateTimeProcessor: DateTimeProcessor,
    private errorService: ErrorMessagingService
    
      ) {
    this.moment = this.dateTimeProcessor.getMoment();
    if (window.innerWidth >= 500) {
      this.config.width = '60%';
    }
    if (this.config && this.config.data && this.config.data.type) {
      this.type = this.config.data.type;
      console.log("this.type", this.type)
    }
    if (this.config && this.config.data && this.config.data.account) {
      this.account_id = this.config.data.account;
    }
    if (this.config && this.config.data && this.config.data.itemDetails) {
      this.itemDetails = this.config.data.itemDetails;
      if (this.itemDetails && this.itemDetails.item && this.itemDetails.item.price) {
        this.itemPrice = this.itemDetails.item.price;
        console.log("this.itemDetails", this.itemDetails)
      }
    }
    if (this.type == 'add') {
      if (this.config && this.config.data && this.config.data.data) {
        this.itemData = this.config.data.data;
      }
    }
    if (this.type == 'edit') {
      if (this.config && this.config.data && this.config.data.data && this.config.data.data) {
        this.itemData = this.config.data.data.questionnaireData;
        this.answers = this.config.data.data.answersData;
        this.questionnaireAnswers = this.config.data.data.postData.answerLine;
        this.totalPrice = this.config.data.data.postData.totalPrice;
        console.log("Constructor: Total Price:", this.totalPrice);
        this.qnrId = this.config.data.data.postData.questionnaireId;
      }
    }

    if (this.type == 'repeat') {
      this.config.width = '50%';
      this.config.header = "Repeat Last Customization";
      if (this.config && this.config.data && this.config.data.data && this.config.data.lastCustomization) {
        this.lastCustomization = this.config.data.lastCustomization;
        console.log("Last Customization",this.lastCustomization);
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth >= 500) {
      this.config.width = '60%';
    }
  }

  ngOnInit(): void {
    if (this.type == 'edit') {
      this.totalPrice = this.config.data.data.postData.totalPrice
      console.log("Constructor: Oninit Price:", this.totalPrice);
    }
    if (this.itemData && this.itemData.labels) {
      this.qnrId = this.itemData.id;
      this.labels = this.itemData.labels;
      if (this.type == 'add') {
        if (this.labels[0]['question']['dataGridListProperties']['dataGridListColumns'][0]['listPropertie'] && this.labels[0]['question']['dataGridListProperties']['dataGridListColumns'][0]['listPropertie']['maxAnswerable'] == 1) {
          this.answers[0] = this.labels[0]['question']['dataGridListProperties']['dataGridListColumns'][0]['listPropertie']['values'][0];
        }
        else if (this.labels[0]['question']['dataGridListProperties']['dataGridListColumns'][0]['listPropertie'] && this.labels[0]['question']['dataGridListProperties']['dataGridListColumns'][0]['listPropertie']['maxAnswerable'] > 1) {
          this.answers[0] = [this.labels[0]['question']['dataGridListProperties']['dataGridListColumns'][0]['listPropertie']['values'][0]];
        }
        else {
          this.answers[0] = "";
        }
        this.labels.forEach(element => {
          let answerLine = {
            "labelName": element.question.labelName,
            "answer": {
              "dataGridList": [
                {
                  "dataGridListColumn": []
                }
              ]
            }
          }
          this.questionnaireAnswers.push(answerLine)
        });
        this.getPriceValue(this.labels[0].question.dataGridListProperties.dataGridListColumns[0].listPropertie, this.answers[0])
        this.saveAnswers(this.labels[0], this.labels[0].question.dataGridListProperties.dataGridListColumns[0], 0, this.answers[0])
        this.totalPrice = this.itemPrice + Number(this.getPriceValue(this.labels[0].question.dataGridListProperties.dataGridListColumns[0].listPropertie, this.answers[0]))
      }
    }
  }
  close() {
    this.itemOptionsRef.close()
  }

  ngOnDestroy() {
    this.itemOptionsRef.close()
  }

  getDataGridListColumns(data) {
    this.questionsLength = data.length
    return data;
  }

  convertDate(event, questions, question, i) {
    console.log(event)
    this.answers[i] = this.moment(event).format('DD-MM-YYYY')
    console.log(typeof (this.answers[i]))
    this.saveAnswers(questions, question, i)
  }

  convertToDate(date) {
    let dateToConvert = new Date(date);
    return this.moment(dateToConvert).format('DD-MM-YYYY');
  }

  getPriceValue(listPropertie, value) {
    let basePriceJson = this.sharedService.convertToJsonFromString(listPropertie.basePrice);
    this.basePriceList = basePriceJson;
    return basePriceJson[value]
  }

  getPriceValueFromGridList(priceGridList, columnId, value) {
    let priceGridListJson = JSON.parse(priceGridList);
    this.priceGridList = priceGridListJson;
    return priceGridListJson[this.answers[0]][columnId][value];
  }

  saveAnswers(questionsObj, question, index, value?) {
    let column = {
      "columnId": question.columnId,
      "column": {},
      "quantity": 1
    }
    let maxAnswerable = question && question.listPropertie && question.listPropertie.maxAnswerable && question.listPropertie.maxAnswerable ? question.listPropertie.maxAnswerable : null;

    if (maxAnswerable && maxAnswerable > 1 && question.dataType == 'list') {
      column["column"][question.dataType] = this.answers[index];
    } else {
      if (question.dataType == 'list' || question.dataType == 'fileUpload') {
        column["column"][question.dataType] = [this.answers[index]];
      } else {
        column["column"][question.dataType] = this.answers[index];
      }
    }

    if (question && question.listPropertie && question.listPropertie.basePrice && question.listPropertie.maxAnswerable && question.listPropertie.maxAnswerable == 1) {
      column["price"] = Number(this.basePriceList[this.answers[index]]);
    }
    else if (question && question.listPropertie && !question.listPropertie.basePrice && question.listPropertie.maxAnswerable && question.listPropertie.maxAnswerable > 1) {
      let price = 0;
      for (let i = 0; i < this.answers[index].length; i++) {
        price = price + this.priceGridList[this.answers[0]][question.columnId][this.answers[index][i]];
      }
      column["price"] = price;
    }

else if (question && question.listPropertie && !question.listPropertie.basePrice && question.listPropertie.maxAnswerable && question.listPropertie.maxAnswerable == 1) {
  let price = 0;
  price = price + this.priceGridList[this.answers[0]][question.columnId][this.answers[index]];
  column["price"] = price;
}
    else {
      column["price"] = 0;
    }
    for (let i = 0; i < this.questionnaireAnswers.length; i++) {
      if (this.questionnaireAnswers[i].labelName == questionsObj.question.labelName) {
        let questionnaireAnswersIndex = this.questionnaireAnswers[i]["answer"]["dataGridList"][0]["dataGridListColumn"];
        questionnaireAnswersIndex.map((element) => {
          if (element.columnId == column.columnId) {
            questionnaireAnswersIndex.splice(questionnaireAnswersIndex.indexOf(element), 1);
          }
        })
        questionnaireAnswersIndex.push(column);
      }
    }
    this.getTotalPrice();
  }

  getTotalPrice() {
    const _this=this;
    console.log("Item Price:", _this.itemPrice);
    if (_this.itemPrice) {
      _this.totalPrice = _this.itemPrice;
    } else {
      _this.totalPrice = 0;
    }   
    console.log("Total Price:", _this.totalPrice);
    for (let i = 0; i < _this.questionnaireAnswers.length; i++) {
      let questionnaireAnswersIndex = _this.questionnaireAnswers[i]["answer"]["dataGridList"][0]["dataGridListColumn"];
      console.log("Questionaire Map:", questionnaireAnswersIndex);
      questionnaireAnswersIndex.map((element) => {
        _this.totalPrice = _this.totalPrice + Number(element.price);
      })
    }
    console.log("Total Price After: ", _this.totalPrice);
    _this.itemTotal = _this.totalPrice;
  }

  next(sequence) {
    const _this=this;
    _this.totalPrice = _this.itemTotal;
    console.log("Next: Total Price:", _this.totalPrice);
    if (this.timeType >= 1 && _this.timeType < sequence) {
      _this.timeType = _this.timeType + 1;
    }
    else {
      let postData = {
        'questionnaireId': _this.qnrId,
        'answerLine': _this.questionnaireAnswers,
        'totalPrice': _this.totalPrice
      }
      let fileData = {
        'selectedFiles': _this.selectedFiles,
        'fileToUpload': _this.filesToUpload
      }
      console.log("_this.totalPrice", _this.totalPrice);  
      
      _this.validateQuestionnaire(postData).then(
        (result: any)=> {
          console.log(result);
          if (result.length === 0) {
            _this.itemOptionsRef.close({ "postData": postData, "fileData": fileData, "answersData": _this.answers });
          }
          else {
            _this.snackbarService.openSnackBar("Required fields missing", { 'panelClass': 'snackbarerror' });
          }
          _this.questionaireService.sendMessage({ type: 'qnrValidateError', value: result });
        },error => {
          let errorObj = _this.errorService.getApiError(error);
          _this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
      });
      


      
    }
  }

  validateQuestionnaire(postData) {
    const _this = this;
    return new Promise(function(resolve) {
      let questionnaireAnswersData = {
        'questionnaireId': postData.questionnaireId,
        'answerLine': postData.answerLine
      }
      if (!_this.questionnaireAnswers) {
        _this.questionnaireAnswers = {
          answers: {
            answerLine: [],
            questionnaireId: postData.questionnaireId
          }
        }
      }
      if (questionnaireAnswersData) {
        _this.questionaireService.validateConsumerQuestionnaire(questionnaireAnswersData, _this.account_id).subscribe((data: any) => {
          console.log("result Data", data)
          resolve(data);
        }, (error) => {
          _this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
        });
      }
    })
    
  }

  convertToJson(data) {
    return JSON.parse(data);
  }

  convertStringToJson(data) {
    let commaSeparatedArray = data.split(',');
    console.log(commaSeparatedArray);
  }

  getDate(date) {
    console.log(new Date(this.moment(new Date(date)).format('YYYY-MM-DD')));
    return new Date(this.moment(new Date(date)).format('YYYY-MM-DD'));
  }

  addNewItemOptions() {
    this.itemOptionsRef.close({ "lastCustomization": this.lastCustomization, "type": "addNew" });
  }

  repeatLastItemOptions() {
    this.itemOptionsRef.close({ "lastCustomization": this.lastCustomization, "type": "repeatLast" });
  }


  filesUpload(event, questionsObj, type, question, index) {
    const _this = this;
    this.selectedFiles[type] = { files: [], base64: [], caption: [] };
    console.log("Event ", event, type);
    const input = event.files;
    console.log("input ", input);
    _this.fileService.filesSelected(event, _this.selectedFiles[type]).then(
      () => {
        for (const pic of input) {
          let fileObj = {
            caption: type,
            mimeType: pic["type"],
            action: 'add'
          }
          fileObj['file'] = pic;
          fileObj['columnId'] = type;
          _this.filesToUpload.push(fileObj);
          _this.answers[index] = fileObj;
          console.log(_this.answers[index]);
        }
        console.log(JSON.stringify(this.answers))
        console.log("questionnaireAnswers", this.questionnaireAnswers);
        _this.saveAnswers(questionsObj, question, index);
      }).catch((error) => {
        _this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
      });
  }
}
