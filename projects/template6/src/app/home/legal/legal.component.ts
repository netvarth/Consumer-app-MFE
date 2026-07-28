import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedService } from 'jconsumer-shared';

@Component({
  selector: 'app-legal',
  templateUrl: './legal.component.html',
  styleUrls: ['./legal.component.scss']
})
export class LegalComponent implements OnInit {
  theme: any;
  isPrivacy = false;

  constructor(
    private route: ActivatedRoute,
    private sharedService: SharedService,
    private location: Location
  ) {}

  ngOnInit(): void {
    const templateConfig = this.sharedService.getTemplateJSON();
    this.theme = templateConfig?.theme;
    this.isPrivacy = this.route.snapshot.routeConfig?.path === 'privacy-policy';
  }

  goBack(): void {
    this.location.back();
  }
}

