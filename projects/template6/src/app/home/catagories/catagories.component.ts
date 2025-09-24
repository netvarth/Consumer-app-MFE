import { Component } from '@angular/core';
import { ErrorMessagingService, OrderService, SharedService, ToastService } from 'jconsumer-shared';
import { Location } from '@angular/common';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-catagories',
  templateUrl: './catagories.component.html',
  styleUrl: './catagories.component.scss'
})
export class CatagoriesComponent {
  itemCategories: any;
  accountId: any;
  cdnPath: string = '';
  loading: any = true;
constructor(
   private orderService: OrderService,
    private sharedService: SharedService,
    private location: Location,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private errorService: ErrorMessagingService,
    private toastService: ToastService,
)
{ this.cdnPath = this.sharedService.getCDNPath();
  this.accountId = this.sharedService.getAccountID();
}

  ngOnInit(): void {
  this. getCategories();
  }

  getCategories() {
    this.orderService.getItemCategory(this.accountId).subscribe(
      (categories: any) => {
        this.itemCategories = categories;
        this.loading = false;
      },
      (error: any) => {
        this.loading = false;
        let errorObj = this.errorService.getApiError(error);
        this.toastService.showError(errorObj);
      })
  }

  viewCategoryItems(categoryId, target: any) {
    const queryParams = { ...this.activatedRoute.snapshot.queryParams, ['target']: target };
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: queryParams,
      queryParamsHandling: 'merge' // Merge with existing query params
    });
    console.log('this.itemCategories',categoryId)
    const navigationExtras: NavigationExtras = {
      queryParams: {
        categoryId: categoryId,
      }
    }
    setTimeout(() => {
      this.router.navigate([this.sharedService.getRouteID(), 'items'], navigationExtras);
    }, 100);
  }
 
  goBack() {
    this.location.back();
  }
   
}
