import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Template6Service {

  basicProfile;
  extras;
  selectedLocation;
  users;
  domain;
  constructor() { 
  
  }
  getDomain() {
    return this.domain;
  }

  setDomain(domain) {
    this.domain= domain;
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

  getUsers() {
    return this.users;
  }
  setUsers(users){
    this.users=users;
  }

}
