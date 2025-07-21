import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { ConsumerService } from '../../services/consumer-service';
import { AuthService } from '../../services/auth-service';
import { AccountService } from '../../services/account-service';
import { GroupStorageService } from 'jaldee-framework/storage/group';
import { FileService } from 'jaldee-framework/file';
import { PreviewuploadedfilesComponent } from 'jaldee-framework/previewuploadedfiles';

@Component({
  selector: 'app-prescriptions',
  templateUrl: './prescriptions.component.html',
  styleUrls: ['./prescriptions.component.css']
})
export class PrescriptionsComponent implements OnInit {

  accountId: any;
  customId: any;
  theme: any;
  prescriptions: any = [];
  loading = true;
  fileviewdialogRef: any;
  loggedIn = true;  // To check whether user logged in or not
  accountConfig;
  account: any;
  accountProfile: any;
  constructor(
    private consumerService: ConsumerService,
    private groupStorageService: GroupStorageService,
    private accountService: AccountService,
    private fileService: FileService,
    private dialog: MatDialog,
    private location: Location,
    private authService: AuthService
  ) { }

  initPrescriptions() {
    this.authService.goThroughLogin().then((status) => {
      console.log("Status:", status);
      if (status) {
        this.loggedIn = true;
        const activeUser = this.groupStorageService.getitemFromGroupStorage('ynw-user');
        console.log(activeUser);
        this.consumerService.getPrescriptions().subscribe(
          (prescriptions: any) => {
            this.prescriptions = prescriptions;
            this.loading = false;
          }, error => {
            this.loading = false;
          }
        )
      } else {
        this.loggedIn = false;
        this.loading = false;
      }
    });
  }
  ngOnInit(): void {
    this.account = this.accountService.getAccountInfo();
    this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
    this.accountId = this.accountProfile.id;
    this.initPrescriptions();
  }
  getImageType(prescription) {
    console.log(prescription.fileType);
    if (prescription.fileType == 'jpeg' || prescription.fileType == 'png' || prescription.fileType == 'jpg') {
      return prescription.s3path;
    } else {
      return this.fileService.getImageByType(prescription.fileType);
    }
  }
  actionPerformed(event) {
    this.accountService.sendMessage({ ttype: 'refresh' })
    this.initPrescriptions();
  }
  preview(file) {
    if (
      file.fileType === "jpg" || file.fileType === "jpeg" || file.fileType === "png" || file.fileType === "bmp" || file.fileType === "webp" || file.fileType === "image/png" ||
      file.fileType === "image/jpeg" ||
      file.fileType === "image/jpg" ||
      file.fileType === "jfif"
    ) {
      this.fileviewdialogRef = this.dialog.open(PreviewuploadedfilesComponent, {
        panelClass: [
          "popup-class",
          "commonpopupmainclass",
          "uploadfilecomponentclass"
        ],
        disableClose: true,
        data: {
          file: file
        }
      });
      this.fileviewdialogRef.afterClosed().subscribe(result => {
        if (result) {
        }
      });
    } else {
      const a = document.createElement("a");
      a.href = file.filePath;
      a.download = file.filePath.split("/").pop();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return '<a [href]="file.filePath" target="_blank" [download]="file.fileName"></a>';
    }
  }
  previewFile(prescription) {
    window.open(prescription.prescriptionAttachments[0].s3path)
  }
  goback() {
    this.location.back();
  }
}
