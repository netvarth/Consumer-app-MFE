import { Component } from '@angular/core';
import { projectConstants } from '../../environment';

@Component({
    selector: 'app-not-found',
    templateUrl: './not-found.component.html',
    styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent {
    cdnPath = projectConstants.CDNURL;
    constructor() { }
}
