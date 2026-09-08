import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {

  basicProfile;
  extras;
  selectedLocation;

  constructor() { 
  
  }

  getSelectedLocation() {
    return this.selectedLocation;
  }

  setLocation(location) {
    this.selectedLocation = location;
  }

  setBasicProfile(profile) {
    this.basicProfile = profile;
  }

  getProfile() {
    return this.basicProfile;
  }

  getExtras() {
    return this.extras;
  }

  setExtras(extras) {
    this.extras = extras;
  }

}
