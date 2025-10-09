import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConsumerService, GroupStorageService, projectConstantsLocal, SharedService } from 'jconsumer-shared';

@Component({
  selector: 'app-consumer-email',
  templateUrl: './consumer-email.component.html',
  styleUrls: ['./consumer-email.component.css']
})
export class ConsumerEmailComponent implements OnInit {
  email_id: any;
  update_email: any;
  apiError = false;
  apiErrorTxt: any;
  customer: any;
  userData: any;
  theme: any;
  config: any;
  constructor(
    public dialogRef: MatDialogRef<ConsumerEmailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private consumerService: ConsumerService,
    private groupStorage: GroupStorageService,
    private sharedService: SharedService
  ) { }

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.userData = this.groupStorage.getitemFromGroupStorage('jld_scon');
    this.config = this.sharedService.getAccountConfig();
    if (this.config.theme) {
      this.theme = this.config.theme;
    }
  }
  cancel() {
    this.dialogRef.close();
  }
  onSubmit() {
    this.apiError = false;
    if (this.isValidEmail(this.email_id)) {
      if (this.update_email) {
        this.updateSPConsumerEmail().then(result => {
          if (result && result !== undefined) {
            this.dialogRef.close(this.email_id);
          }
        });
      } else {
        this.dialogRef.close(this.email_id);
      }
    } else {
      this.apiError = true;
      this.apiErrorTxt = 'Please enter valid email';
    }

  }
  isValidEmail(email) {
    var re = projectConstantsLocal.VALIDATOR_EMAIL;
    return re.test(email);
  }

  updateSPConsumerEmail() {
    const _this = this;
    return new Promise(function (resolve, reject) {
      const userObj = {};
      const firstName = _this.userData.firstName
      const lastName = _this.userData.lastName;
      userObj['id'] = _this.userData.providerConsumer;
      userObj['email'] = _this.email_id;
      userObj['firstName'] = firstName;
      userObj['lastName'] = lastName;
      _this.consumerService.updateSPConsumer(userObj)
        .subscribe(data => {
          _this.userData['email'] = _this.email_id;
          _this.groupStorage.setitemToGroupStorage('jld_scon', _this.userData);
          resolve(data);
        }, (error) => {
          _this.apiError = true;
          _this.apiErrorTxt = error.error;
          reject();
        }
        );
    });
  }
}
