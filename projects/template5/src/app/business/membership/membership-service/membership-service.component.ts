import { Component, OnInit, ViewChild } from '@angular/core';
import { AccountService } from '../../../services/account-service';
import { MembershipService } from '../membership.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackbarService } from 'jaldee-framework/snackbar';
import { ConsumerService } from '../../../services/consumer-service';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-membership-service',
  templateUrl: './membership-service.component.html',
  styleUrls: ['./membership-service.component.css']
})
export class MembershipServiceComponent implements OnInit {

  @ViewChild('modal') modal; // referring modal object
  account: any;
  accountConfig: any;
  theme: any;
  accountProfile: any;
  accountId: any;
  memberService;
  memberServiceId: any;
  questionAnswers: any;
  api_loading_video: boolean;
  isClickedOnce: boolean;
  questionaireList: any;
  registrationDone = false;
  loggedIn: boolean = true;
  memberShip: any;
  constructor(
    private accountService: AccountService,
    private membershipService: MembershipService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackbarService: SnackbarService,
    private consumerService: ConsumerService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const _this = this;
    _this.activatedRoute.params.subscribe((params)=> {
      _this.memberServiceId = params['serviceId'];
      }
    )
    _this.account = _this.accountService.getAccountInfo();
    _this.accountConfig = _this.accountService.getAccountConfig();
    if (_this.accountConfig && _this.accountConfig['theme']) {
      _this.theme = _this.accountConfig['theme'];
    }
    _this.accountProfile = _this.accountService.getJson(_this.account['businessProfile']);
    _this.accountId=_this.accountProfile.id;

    this.authService.goThroughLogin().then((status)=> {
      if (status) {
        this.loggedIn = true;
        this.proceed();
      } else{
        this.loggedIn = false;
      }
    })

 
    
  }
  actionPerformed(event) {
      this.loggedIn = true;
      this.proceed();
  }
  proceed() {
    const _this=this;
    _this.membershipService.getMemberServices(_this.accountId).subscribe((services: any)=> {
      console.log("Services:", services);
      let membership = services.filter((service)=> service.memberShipService.id == _this.memberServiceId);
      _this.memberShip = membership[0];
      _this.memberService = _this.memberShip.memberShipService;
      console.log("_this.memberService",_this.memberService);
      console.log("MemberShip:",membership);
      if ( _this.memberShip.status){
      } else {              
      _this.membershipService.getMemberServiceQuestionaire(_this.memberService.id, 'ONLINE', _this.accountId).subscribe(
        (questionaire: any)=>{
          _this.questionaireList = questionaire;
          if (_this.questionaireList.id && _this.questionaireList.id == 0)
          console.log(questionaire);
        }, (error)=> {
          console.log(error);
          _this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
        });
      }      
    }, (error)=>{
      _this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
    });
  }
  getAnswers(event){
    this.questionAnswers = event;
  }

  register() {
    const _this=this;
    _this.consumerService.getProviderConsumer().subscribe(
      (spConsumer:any) => {
        let postData= {
          'firstName': spConsumer.firstName,
          'lastName':spConsumer.lastName,
          'phoneNo':spConsumer.phoneNo,
          'memberServiceId':_this.memberServiceId,
          'countryCode':spConsumer.countryCode
        };

        _this.membershipService.register(postData).subscribe(
          (memberId)=> {
            console.log(memberId);
            _this.submitQuestionnaire(memberId);
          },(error)=> {
            console.log(error);
            _this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
          }
        );
      })
  }
  uploadFiles(file, url, s3Obj?) {
    const _this = this;
    return new Promise(function (resolve, reject) {
      _this.membershipService.videoaudioS3Upload(file, url)
        .subscribe(() => {
          resolve(true);
        }, error => {
          if (s3Obj) {
            delete _this.questionAnswers.filestoUpload[s3Obj.labelName][s3Obj.document];
          }
          // _this.subscriptionService.sendMessage({ttype:'loading_file_stop'});
          console.log("this.questionAnswers.answers", _this.questionAnswers.answers.answerLine[0].answer.fileUpload)
          _this.questionAnswers.answers.answerLine[0].answer.fileUpload.forEach(element => {
            if (element.caption && element.caption == s3Obj.document) {
              _this.questionAnswers.answers.answerLine[0].answer.fileUpload.splice(
                _this.questionAnswers.answers.answerLine[0].answer.fileUpload.indexOf(element), 1)
            }
          });
          _this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
          resolve(false);
        });
    })
  }
  submitQuestionnaire(uuid, type?) {
    const _this = this;
    // const dataToSend: FormData = new FormData();
    let questionAnswer: any;
    if (this.questionAnswers && this.questionAnswers.answers) {
      questionAnswer = this.questionAnswers.answers;
    }
    // const blobpost_Data = new Blob([JSON.stringify(questionAnswer)], { type: 'application/json' });
    // dataToSend.append('question', blobpost_Data);
      _this.membershipService.submitQuestionnaire(questionAnswer, uuid, _this.accountId).subscribe((data: any) => {
        _this.registrationCompleted();
      },(error)=> {
        _this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
      });
  }
  registrationCompleted() {
    this.registrationDone = true;
  }
  goBack() {
    this.router.navigate([this.accountService.getCustomId()])
  }
}
