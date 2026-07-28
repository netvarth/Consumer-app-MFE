import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { PetStoreComponent } from './pet-store.component';
import { StoreHeaderComponent } from './store-header.component';

const routes: Routes = [{ path: '', component: PetStoreComponent }];

@NgModule({
  declarations: [PetStoreComponent, StoreHeaderComponent],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes)]
})
export class PetStoreModule {}
