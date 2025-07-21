import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GroupStorageService } from 'jaldee-framework/storage/group';
import { ConsumerService } from '../../services/consumer-service';

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
  constructor(
    public dialogRef: MatDialogRef<ConsumerEmailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private consumerService: ConsumerService,
    private groupService: GroupStorageService
  ) { }

  ngOnInit(): void {
    this.theme = this.data.theme
    this.userData = this.groupService.getitemFromGroupStorage('ynw-user');
    console.log("User Logged In:",this.userData);
  }
  cancel() {
    this.dialogRef.close();
  }
  onSubmit() {
    this.apiError = false;

    if (this.isValidEmail(this.email_id)) {
      if (this.update_email) {
        this.updateConsumerAccount().then(result => {
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
    var re = /\S+@\S+\.\S+/;
    return re.test(email);

  }
  updateConsumerAccount() {
    const _this = this;
    return new Promise(function (resolve, reject) {
      const userObj = {};
      const firstName = _this.userData.firstName
      const lastName = _this.userData.lastName;
      userObj['id'] = _this.userData.id;
      userObj['email'] = _this.email_id;
      userObj['firstName'] = firstName;
      userObj['lastName'] = lastName;
      _this.consumerService.updateProfile(userObj, 'consumer')
        .subscribe(data => {
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
