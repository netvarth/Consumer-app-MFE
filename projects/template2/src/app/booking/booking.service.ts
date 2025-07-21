import { Injectable } from '@angular/core';
import { ServiceMeta } from 'jconsumer-shared';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  locations: any = [];
  departments: any = [];
  users: any = [];
  services: any = [];
  couponsList: any;
  selectedService: any;
  activeServices: any = [];
  activeUsers: any = [];
  selectedDepartment: any;
  selectedLocation: any;
  selectedUser: any;
  bookingDate: any;
  accountId: any;
  locationId: any;
  bookingType: any;
  paymentDetails: any;
  selectedCoupons: any;
  selectedApptsTime: any;

  constructor(
    private servicemeta: ServiceMeta
  ) { }
  setAccountId(accountId) {
    this.accountId = accountId;
  }
  getAccountId() {
    return this.accountId;
  }
  getTimings() {
    return this.selectedApptsTime;
  }
  setTimings(selectedApptsTime: any) {
    this.selectedApptsTime = selectedApptsTime;
  }
  getLocationId() {
    return this.locationId;
  }
  setLocationId(locationId) {
    this.locationId = locationId;
  }
  setCouponsList(couponsList) {
    this.couponsList = couponsList;
  }
  setBookingDate(bookingDate) {
    this.bookingDate = bookingDate;
  }
  getBookingDate() {
    return this.bookingDate;
  }
  getBookingType() {
    return this.bookingType;
  }
  setBookingType(bookingType) {
    this.bookingType = bookingType;
  }
  getPaymentDetails() {
    return this.paymentDetails;
  }
  setPaymentDetails(paymentDetails) {
    this.paymentDetails = paymentDetails;
  }
  getSelectedCoupons() {
    return this.selectedCoupons;
  }
  setSelectedCoupons(coupons) {
    this.selectedCoupons = coupons;
  }
  getCouponsList() {
    return this.couponsList;
  }
  getServices() {
    return this.services;
  }
  setActiveService(service) {
    this.selectedService = service;
  }
  getSelectedLocation() {
    return this.selectedLocation;
  }
  setSelectedLocation(location) {
    this.selectedLocation = location;
  }
  setSelectedUser(user) {
    this.selectedUser = user;
  }
  getSelectedUser() {
    return this.selectedUser;
  }
  getSelectedDepartment() {
    return this.selectedDepartment;
  }
  setSelectedDepartment(department) {
    this.selectedDepartment = department;
  }
  getSelectedService() {
    return this.selectedService;
  }
  setActiveServices(services) {
    this.activeServices = services;
  }
  getActiveServices() {
    return this.activeServices;
  }
  setLocations(locations) {
    this.locations = locations;
  }
  getLocations() {
    return this.locations;
  }
  setDepartments(departments) {
    this.departments = departments;
    console.log("Deparments:", this.departments);
  }
  getDepartments() {
    console.log("Deparments:", this.departments);
    return this.departments;
  }
  getUsers() {
    return this.users;
  }
  setUsers(users) {
    this.users = users;
  }
  setActiveUsers(users) {
    this.activeUsers = users;
  }
  getActiveUsers() {
    return this.activeUsers;
  }
  clear() {
    this.departments = [];
    this.users = [];
    this.services = [];
    this.couponsList = [];
    this.selectedService = null;
    this.activeServices = [];
    this.activeUsers = [];
  }
  setServices(services: any) {
    let activeServices = services.filter(service => service.serviceAvailability);
    this.services = activeServices;
    this.activeServices = activeServices;
    console.log("Available Services:", activeServices);
  }
  getVirtualServiceInput(selectedService, callingModes, commObj) {
    let virtualServiceArray = {};
    if (callingModes !== '') {
      if (selectedService.virtualCallingModes[0].callingMode === 'GoogleMeet' || selectedService.virtualCallingModes[0].callingMode === 'Zoom') {
        virtualServiceArray[selectedService.virtualCallingModes[0].callingMode] = selectedService.virtualCallingModes[0].value;
      } else {
        virtualServiceArray[selectedService.virtualCallingModes[0].callingMode] = commObj['comWhatsappCountryCode'] + commObj['comWhatsappNo'];;
      }
    }
    for (const i in virtualServiceArray) {
      if (i === 'WhatsApp') {
        return virtualServiceArray;
      } else if (i === 'GoogleMeet') {
        return virtualServiceArray;
      } else if (i === 'Zoom') {
        return virtualServiceArray;
      } else if (i === 'Phone') {
        return virtualServiceArray;
      } else if (i === 'VideoCall') {
        return { 'VideoCall': '' };
      }
    }
    return virtualServiceArray;
  }
  getServicesByDepartment(selectedDeptId: any) {
    console.log("Whole Services getServicesByDepartment:", this.services);
    let activeServices = this.services.filter(service => (service.department === selectedDeptId && service.serviceAvailability && !service.provider));
    this.activeServices = activeServices;
    return activeServices;
  }
  getServicesByUser(selectedUserId: any) {
    console.log("Services getServicesByUser:", this.services);
    console.log("User:", selectedUserId);
    let activeServices = this.services.filter(service => (service.provider?.id === selectedUserId) && service.serviceAvailability);
    this.activeServices = activeServices;
    return activeServices;
  }
  getGlobalServices(deptId?) {
    console.log("Services getGlobalServices:", this.services);
    let activeServices = [];
    if (deptId) {
      activeServices = this.services.filter(service => (!service.provider && service.department == deptId && service.serviceAvailability));
    } else {
      activeServices = this.services.filter(service => (!service.provider && service.serviceAvailability));
    }
    this.activeServices = activeServices;
    return activeServices;
  }
  getAppointmentByConsumerUUID(uuid, accountid) {
    const url = 'consumer/appointment/' + uuid + '?account=' + accountid;
    return this.servicemeta.httpGet(url);
  }
  getAppointmentServices(locationId) {
    const _this = this;
    return new Promise(function (resolve, reject) {
      _this.getServicesforAppontmntByLocationId(locationId).subscribe(
        (services: any) => {
          resolve(services);
        }
      ), () => {
        resolve([]);
      }
    }
    );
  }
  getServicesByLocationId(locid) {
    const url = 'consumer/waitlist/services/' + locid;
    return this.servicemeta.httpGet(url);
  }
  getLocationsByServiceId(serviceId) {
    const url = 'consumer/service/' + serviceId + '/location';
    return this.servicemeta.httpGet(url);
  }
  getCheckinServices(locationId) {
    const _this = this;
    return new Promise(function (resolve, reject) {
      _this.getServicesByLocationId(locationId).subscribe(
        (services: any) => {
          resolve(services);
        }
      ), () => {
        resolve([]);
      }
    })
  }
  getServicesforAppontmntByLocationId(locid) {
    if (locid) {
      const url = 'consumer/appointment/service/' + locid;
      return this.servicemeta.httpGet(url);
    }
    return null;
  }
  getAvailableDatessByLocationService(locid, servid, accountid?) {
    const url = 'consumer/appointment/availability/location/' + locid + '/service/' + servid + '?account=' + accountid;
    return this.servicemeta.httpGet(url);
  }
  getServicebyLocationId(locationId) {
    console.log("Location Id:", locationId);
    const _this = this;
    return new Promise(function (resolve, reject) {
      if (_this.services && _this.services.length > 0) {
        resolve(_this.services);
      } else {
        _this.getAppointmentServices(locationId).then(
          (appointmentServices: any) => {
            _this.getCheckinServices(locationId).then(
              (wlServices: any) => {
                let services = [...appointmentServices, ...wlServices];
                resolve(services);
              }
            )
          }
        )
      }
    });
  }
  /**
   *  returns Available dates for calendar
   * @param locid location id
   * @param servid service id
   * @param accountid account id
   */
  getSchedulesbyLocationandServiceIdavailability(locid, servid, accountid) {
    const _this = this;
    return new Promise(function (resolve) {
      if (locid && servid && accountid) {
        _this.getAvailableDatessByLocationService(locid, servid, accountid)
          .subscribe((data: any) => {
            const availables = data.filter(obj => obj.availableSlots);
            const availDates = availables.map(function (a) { return a.date; });
            let availableDates = availDates.filter(function (elem, index, self) {
              return index === self.indexOf(elem);
            });
            resolve(availableDates);
          }, () => {
            resolve([]);
          });
      }
    })
  }
  getQueuesbyLocationandServiceIdavailability(locid, servid, accountid) {
    const _this = this;
    let availableDates = [];
    if (locid && servid && accountid) {
      this.getQueuesbyLocationandServiceIdAvailableDates(locid, servid, accountid)
        .subscribe((data: any) => {
          const availables = data.filter(obj => obj.isAvailable);
          const availDates = availables.map(function (a) { return a.date; });
          availableDates = availDates.filter(function (elem, index, self) {
            return index === self.indexOf(elem);
          });
        });
    }
    return availableDates;
  }
  getQueuesbyLocationandServiceIdAvailableDates(locid, servid, accountid) {
    const url = 'consumer/waitlist/queues/available/' + locid + '/' + servid + '?account=' + accountid;
    return this.servicemeta.httpGet(url);
  }
  validateVirtualCallInfo(callingModes, selectedService, commObj) {
    let valid = true;
    console.log("Calling Modes:", callingModes);
    if (callingModes === '' || callingModes.length < 10) {
      for (const i in selectedService.virtualCallingModes) {
        if (selectedService.virtualCallingModes[i].callingMode === 'WhatsApp' || selectedService.virtualCallingModes[i].callingMode === 'Phone') {
          if (!commObj['comWhatsappNo'] && selectedService.serviceBookingType !== 'request') {
            valid = false;
            break;
          }
        }
      }
    }
    return valid;
  }
  getRescheduledInfo(bookingId, accountId, bookingMode) {
    const _this = this;
    return new Promise(function (resolve, reject) {
      if (!bookingId) {
        resolve(false);
      } else {
        if (bookingMode === 'Appointment') {
          _this.getAppointmentByConsumerUUID(bookingId, accountId).subscribe(
            (appointmentInfo) => {
              resolve(appointmentInfo);
            }
          )
        } else {
          _this.getCheckinByConsumerUUID(bookingId, accountId).subscribe(
            (waitlistInfo) => {
              resolve(waitlistInfo);
            }
          )
        }

      }
    })
  }
  addApptAdvancePayment(param, body) {
    const url = 'consumer/appointment/advancePayment';
    return this.servicemeta.httpPut(url, body, null, param);
  }
  addWaitlistAdvancePayment(param, body) {
    const url = 'consumer/waitlist/advancePayment';
    return this.servicemeta.httpPut(url, body, null, param);
  }
  getCheckinByConsumerUUID(uuid, accountid) {
    console.log("UUID:", uuid);
    const url = 'consumer/waitlist/' + uuid + '?account=' + accountid;
    return this.servicemeta.httpGet(url);
  }
  getSlotsByLocationServiceandDate(locid, servid, pdate, accountid) {
    const url = 'consumer/appointment/schedule/date/' + pdate + '/location/' + locid + '/service/' + servid + '?account=' + accountid;
    return this.servicemeta.httpGet(url);
  }
  /**
     * 
     * @param locid Location Id
     * @returns services of location
     */
  getQueuesbyLocationServiceAndDate(locid, servid, pdate, accountid) {
    const _this = this;
    return new Promise(function (resolve, reject) {
      _this.getQueuesbyLocationandServiceId(locid, servid, pdate, accountid)
        .subscribe((queues: any) => {
          resolve(queues);
        }, () => {
          resolve([]);
        })
    })
  }
  getQueuesbyLocationandServiceId(locid, servid, pdate?, accountid?) {
    const dd = (pdate !== undefined) ? '/' + pdate + '?account=' + accountid : '';
    const url = 'consumer/waitlist/queues/' + locid + '/' + servid + dd;
    return this.servicemeta.httpGet(url);
  }
  getConvenientFeeOfProvider(provid, data?) {
    const url = 'consumer/payment/modes/convenienceFee/' + provid;
    return this.servicemeta.httpPut(url, data);
  }
  getApptCoupons(servId, locId) {
    const url = 'consumer/appointment/service/' + servId + '/location/' + locId + '/coupons';
    return this.servicemeta.httpGet(url);
  }
  getCheckinCoupons(servId, locId) {
    const url = 'consumer/waitlist/service/' + servId + '/location/' + locId + '/coupons';
    return this.servicemeta.httpGet(url);
  }
  getServiceById(serviceId, type) {
    let service = this.services.filter(service => (service.id === serviceId && service.bType === type));
    return service[0];
  }


  getSchedulesbyMonthandServiceIdavailability(locid, servid, month, year, accountid) {
    const _this = this;
    return new Promise(function (resolve) {
      if (locid && servid && accountid) {
        _this.getAvailabilityByMonth_Year(locid, servid, month, year, accountid)
          .subscribe((data: any) => {
            const availables = data.filter(obj => obj.availableSlots);
            const availDates = availables.map(function (a) { return a.date; });
            let availableDates = availDates.filter(function (elem, index, self) {
              return index === self.indexOf(elem);
            });
            resolve(availableDates);
          }, () => {
            resolve([]);
          });
      }
    })
  }
  getAvailabilityByMonth_Year(locid, servid, month, year, accountid?) {
    const url = 'consumer/appointment/availability/location/' + locid + '/service/' + servid + '/' + month + '/' + year + '?account=' + accountid;
    return this.servicemeta.httpGet(url);
  }
  linkIpPayment_invoic(data) {
    const url = 'consumer/ip/pay';
    return this.servicemeta.httpPost(url, data);
  }
  getIpInvoiceDetailsById(accId, uuid) {
    const url = 'consumer/ip/invoice/' + accId + '/' + uuid;
    return this.servicemeta.httpGet(url);
  }

}




