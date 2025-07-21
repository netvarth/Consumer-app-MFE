import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject ,  Observable } from 'rxjs';
import { ConfirmBoxComponent } from 'jaldee-framework/confirm';

@Injectable()
export class GalleryService {
    private subject = new Subject<any>();

    constructor(private dialog: MatDialog) {

    }

    sendMessage(message: any) {
        this.subject.next(message);
    }

    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }

    clearMessages() {
        this.subject.next(null);
    }

    confirmGalleryImageDelete(ob, file) {
        ob.delgaldialogRef = this.dialog.open(ConfirmBoxComponent, {
          width: '50%',
          panelClass: ['commonpopupmainclass', 'confirmationmainclass'],
          disableClose: true,
          data: {
            'message': 'Do you want to delete this image ?',
            'heading': 'Delete Confirmation'
          }
        });
    
        ob.delgaldialogRef.afterClosed().subscribe(result => {
          if (result) {
            ob.deleteImage(file);
          }
        });
      }
}
