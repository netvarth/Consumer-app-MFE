import { Component, OnInit } from '@angular/core';
import { projectConstantsLocal, SubscriptionService } from 'jconsumer-shared';
import { TemplateService } from '../template/template.service';

@Component({
  selector: 'app-basic-profile',
  templateUrl: './basic-profile.component.html',
  styleUrls: ['./basic-profile.component.css']
})
export class BasicProfileComponent implements OnInit {
  selectedLocation: any;
  basicProfile: any;
  extras;
  orgsocial_list = projectConstantsLocal.SOCIAL_MEDIA_CONSUMER;

  constructor(private subscriptionService: SubscriptionService,
    private templateService: TemplateService) {
  }

  ngOnInit(): void {
    this.selectedLocation = this.templateService.getSelectedLocation();
    this.basicProfile = this.templateService.getProfile();
    this.extras = this.templateService.getExtras();
  }

  bookNow() {
    this.subscriptionService.sendMessage({ttype:'menu', value: 'services'});
  }

  communicate() {
    this.subscriptionService.sendMessage({ttype:'communicate'});
  }
  aboutUs() {
    this.subscriptionService.sendMessage({ttype:'menu', value: 'about'});
  }
  getSocialdet(key, field) {
    const retdet = this.orgsocial_list.filter(
      soc => soc.key === key);
    let returndet = retdet[0][field];
    if (returndet === 'BizyGlobe') {
      returndet = 'bizyGlobe';
    }
    return returndet;
  }
}
