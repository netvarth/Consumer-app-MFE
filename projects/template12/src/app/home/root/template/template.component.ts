import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { SubscriptionService } from 'jconsumer-shared';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css']
})
export class TemplateComponent implements OnInit, OnChanges, OnDestroy {
  @Input() templateId;
  @Input() section;
  @Input() terminologiesjson;
  @Input() templateJson;
  @Input() accountProfile;
  @Input() selectedLocation;
  @Input() departments;
  @Input() settings;
  @Input() apptSettings;
  @Input() checkinServices;
  @Input() apptServices;
  @Input() donationServices;
  @Input() galleryjson;
  @Input() accountConfig;
  filteredServices
  showDepartments: any;
  customOptions = {
    loop: false,
    items: 4,
    margin: 10,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    autoWidth:true,
    navSpeed: 200,
    dots: false,
    center: false,
    checkVisible: false,
    responsive: {
      0: {
        items: 4
      },
      500: {
        items: 7
      },
      768: {
        items: 7
      },
      1200: {
        items: 9
      }
    }
  }
  constructor(private subscriptionService: SubscriptionService,
    private cdRef: ChangeDetectorRef) { 
      
  }

  ngOnDestroy(): void {
    console.log("destory");
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    console.log(this.section);
    this.showDepartments = this.settings.filterByDept;
  }

  blogReadMore(blog) {
    window.open(blog.link, "_system");
  }
  videoClicked(video) {
    window.open(video.link, "_system");
  }
  showMoreVideo(link) {
    window.open(link, "_system");
  }
  quickActionPerformed(action) {
    this.subscriptionService.sendMessage({ttype:'quickaction', value: action});
  }
  actionPerformed(action) {
    this.subscriptionService.sendMessage({ttype:'action', value: action});
  }
  profileActionPerformed(action) {
    this.subscriptionService.sendMessage({ttype:'profile', value: action});
  }
}
