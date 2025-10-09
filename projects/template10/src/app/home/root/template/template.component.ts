import { AfterViewInit, ChangeDetectorRef, Component, HostListener, Input } from '@angular/core';
import { JGalleryService, LocalStorageService, SubscriptionService } from 'jconsumer-shared';
import { Template6Service } from './template6.service';
import { NavigationExtras } from '@angular/router';


@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css']
})
export class TemplateComponent implements AfterViewInit {
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
  @Input() itemCategories: any = [];
  @Input() activeUsers: any = [];
  image_list_popup: any = [];
  filteredServices;
  showDepartments: any;
  customOptions = {
    "items": 2.15,
    "loop": true,
    "margin": 10,
    "autoplay": false,
    "autoplayTimeout": 3000,
    "dots": false
  }
  screenWidth: number;
  small_device_display: boolean;
  allUsers: any;
  carouselReady: boolean = true;
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.screenWidth = window.innerWidth;
    if (this.screenWidth <= 500) {
      this.small_device_display = true;
    } else {
      this.small_device_display = false;
    }
  }
  constructor(private subscriptionService: SubscriptionService,
    private templateService: Template6Service,
    private jGalleryService: JGalleryService,
    private lStorageService: LocalStorageService,
    private cdRef: ChangeDetectorRef) {
    this.onResize();
  }
  ngOnInit() {
    
    // this.accountId = this.accountProfile.id;
    // this.storeEncId = this.lStorageService.getitemfromLocalStorage('storeEncId');
    // if (this.storeEncId) {
    //   this.getStoreCatalogs();
    // }
    // if (this.lStorageService.getitemfromLocalStorage('partner')) {
    //   this.isPartnerLogin = this.lStorageService.getitemfromLocalStorage('partner')
    // }
    // this.loggedUser = this.groupService.getitemFromGroupStorage('ynw-user');
  }

  ngAfterViewInit() {
    this.showDepartments = this.settings.filterByDept;
    this.allUsers = this.templateService.getUsers();
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
    this.actionPerformed(action);
  }
  cardClicked(action) {
    this.actionPerformed(action);
  }
  actionPerformed(action) {
    const type = action.dynamic ? 'page' : action.link ? 'link' : 'action';
    this.subscriptionService.sendMessage({ ttype: type, value: action });
  }
  profileActionPerformed(action) {
    this.subscriptionService.sendMessage({ ttype: 'profile', value: action });
  }
  actionClicked(action) {
    this.actionPerformed(action);
  }

  setCategoryLink(category) {
    let action = {
      link: `items?categoryId=${category.id}&page=0`
    }
    this.actionPerformed(action);
  }
  reOrder(order) {
    let action = {
      type: 'order',
      value: order,
      action: 'reorder'
    }
    this.actionPerformed(action);
  }
  
  viewOrder(order) {
    let action = {
      type: 'order',
      value: order,
      action:'view'
    }
    this.actionPerformed(action);
  }

  private getCurrentIndexCustomLayout(image, images): number {
    return image ? images.indexOf(image) : -1;
  }
  openGallery(image): void {
    let imageIndex = this.getCurrentIndexCustomLayout(image, this.image_list_popup);
    this.jGalleryService.open(this.image_list_popup, imageIndex);
  }
  loadImages(imagelist) {
    console.log("Image List:", imagelist);

    this.image_list_popup = [];
    if (imagelist.length > 0) {
      for (let i = 0; i < imagelist.length; i++) {
        let imgobj = {
          source: imagelist[i].url,
          thumb: imagelist[i].url,
          alt: imagelist[i].caption || ''
        };
        this.image_list_popup.push(imgobj);
      }
    }
    console.log("Image List:", this.image_list_popup);
  }
}
