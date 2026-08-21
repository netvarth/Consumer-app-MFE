import { Injectable } from "@angular/core";
import { DateTimeProcessor, ServiceMeta } from "jconsumer-shared";
import { TeleBooking } from "./models/tele-booking-model";

@Injectable({
    providedIn: 'root'
})

export class TeleBookingService {

    constructor(private servicemeta: ServiceMeta, private dateTimeProcessor: DateTimeProcessor) { }

    getAvailableBookings(countrycode, phonenumber) {
        let bookings = [];
        return new Promise((resolve, reject) => {
            this.getAvailableBookingAppointments(countrycode, phonenumber).then(
                (appointments: any) => {
                    for (let i = 0; i < appointments.length; i++) {
                        let busName = "";
                        let busId = ""
                        let userName;
                        let userId;
                        if (appointments[i].provider) {
                            userName = appointments[i].provider.firstName + ' ' + appointments[i].provider.lastName;
                            userId = appointments[i].provider.id;
                            if (appointments[i].providerAccount && appointments[i].providerAccount.id) {
                                busId = appointments[i].providerAccount.id;
                            }
                        } else {
                            busName = appointments[i].providerAccount.businessName;
                            busId = appointments[i].providerAccount.id;
                        }
                        let consumerName = "";
                        if (appointments[i].appmtFor[0].firstName) {
                            consumerName = appointments[i].appmtFor[0].firstName;
                        }
                        if (appointments[i].appmtFor[0].lastName) {
                            consumerName += " " + appointments[i].appmtFor[0].lastName;
                        }
                        let teleMode = 'video';
                        if (appointments[i].service.virtualServiceType && appointments[i].service.virtualServiceType === 'audioService') {
                            teleMode = 'audio';
                        }
                        let teleUrl = '';
                        if (appointments[i].service.virtualCallingModes[0].callingMode !== 'VideoCall' && appointments[i].service.virtualCallingModes[0].callingMode !== 'WhatsApp') {
                            teleUrl = appointments[i].service.virtualCallingModes[0].value;
                        }
                        let bookingWindow = '';
                        bookingWindow = appointments[i].schedule.apptSchedule.timeSlots[0].sTime + " - " +
                            appointments[i].schedule.apptSchedule.timeSlots[0].eTime;
                        let bookingTime = this.getSingleTime(appointments[i].appmtTime);

                        let bookingStatus = appointments[i].apptStatus;

                        if (appointments[i].apptStatus === 'Started') {
                            bookingStatus = 'is waiting for you';
                        }
                        let btnLabel = 'Join Video Consultation';
                        if (appointments[i].videoCallMessage === 'Call in progress') {
                            btnLabel = 'Re-join Video Consultation';
                        }
                        let booking = new TeleBooking(appointments[i].appmtDate, bookingTime, '',
                            bookingWindow, appointments[i].appointmentEncId, 'appt', appointments[i].service.name,
                            busName, busId, userName, userId, appointments[i].uid, appointments[i].service.virtualCallingModes[0].callingMode,
                            teleMode, teleUrl, bookingStatus, '', consumerName, appointments[i].location.place,
                            appointments[i].location.googleMapUrl, appointments[i].videoCallMessage, appointments[i].videoCallButton, btnLabel);
                        bookings.push(booking);
                    }
                    this.getAvaiableBookingCheckins(countrycode, phonenumber).then(
                        (checkins: any) => {
                            for (let i = 0; i < checkins.length; i++) {
                                let token = '';
                                if (checkins[i].showToken) {
                                    if (checkins[i].token) {
                                        token = checkins[i].token;
                                    } else {
                                        token = '1';
                                    }

                                }
                                let bookingTime = '';
                                if (checkins[i].serviceTime) {
                                    bookingTime = checkins[i].serviceTime;
                                }
                                let busName = "";
                                let busId = "";
                                let userId;
                                let userName;
                                if (checkins[i].provider) {
                                    userName = checkins[i].provider.firstName + ' ' + checkins[i].provider.lastName;
                                    userId = checkins[i].provider.id;
                                    if (checkins[i].providerAccount && checkins[i].providerAccount.id) {
                                        busId = checkins[i].providerAccount.id;
                                    }
                                } else {
                                    busName = checkins[i].providerAccount.businessName;
                                    busId = checkins[i].providerAccount.id;
                                }
                                let consumerName = "";
                                if (checkins[i].waitlistingFor[0].firstName) {
                                    consumerName = checkins[i].waitlistingFor[0].firstName;
                                }
                                if (checkins[i].waitlistingFor[0].lastName) {
                                    consumerName += " " + checkins[i].waitlistingFor[0].lastName;
                                }
                                let teleMode = 'video';
                                if (checkins[i].service.virtualServiceType && checkins[i].service.virtualServiceType === 'audioService') {
                                    teleMode = 'audio';
                                }
                                let teleUrl = '';
                                if (checkins[i].service.virtualCallingModes[0].callingMode !== 'VideoCall' && checkins[i].service.virtualCallingModes[0].callingMode !== 'WhatsApp') {
                                    teleUrl = checkins[i].service.virtualCallingModes[0].value;
                                }
                                let bookingWindow = '';
                                bookingWindow = checkins[i].queue.queueStartTime + " - " +
                                    checkins[i].queue.queueEndTime;

                                let bookingStatus = checkins[i].waitlistStatus;
                                if (checkins[i].waitlistStatus === 'started') {
                                    bookingStatus = 'Doctor is waiting for you';
                                }
                                let btnLabel = 'Join Video Consultation';
                                if (checkins[i].videoCallMessage === 'Call in progress') {
                                    btnLabel = 'Re-join Video Consultation';
                                }
                                let booking = new TeleBooking(checkins[i].date, bookingTime,
                                    bookingWindow, token, checkins[i].checkinEncId, 'wl', checkins[i].service.name,
                                    busName, busId, userName, userId, checkins[i].ynwUuid, checkins[i].service.virtualCallingModes[0].callingMode,
                                    teleMode, teleUrl, bookingStatus, '', consumerName, checkins[i].queue.location.place,
                                    checkins[i].queue.location.googleMapUrl, checkins[i].videoCallMessage, checkins[i].videoCallButton, btnLabel);
                                bookings.push(booking);
                            }
                            resolve(bookings);
                        });
                });
        });
    }
    getSingleTime(slot) {
        const slots = slot.split('-');
        return this.dateTimeProcessor.convert24HourtoAmPm(slots[0]);
    }
    getAvailableBookingAppointments(countrycode, phonenumber) {
        return new Promise((resolve, reject) => {
            this.getAvailableTeleAppointments(countrycode, phonenumber).subscribe(
                (appointments: any) => {
                    resolve(appointments);
                }, () => {
                    resolve([]);
                }
            )
        });
    }
    getAvaiableBookingCheckins(countrycode, phonenumber) {
        return new Promise((resolve, reject) => {
            this.getAvailableTeleCheckins(countrycode, phonenumber).subscribe(
                (checkins: any) => {
                    resolve(checkins);
                }, () => {
                    resolve([]);
                }
            )
        });
    }

    getAvailableTeleAppointments(countrycode, phonenumber) {
        const url = 'consumer/appointment/meeting/' + countrycode + '/' + phonenumber;
        return this.servicemeta.httpGet(url);
    }

    getAvailableTeleCheckins(countrycode, phonenumber) {
        const url = 'consumer/waitlist/meeting/' + countrycode + '/' + phonenumber;
        return this.servicemeta.httpGet(url);
    }
    // getTeleCheckinById(uuid, source, accountId?) {
    //     let params = '';
    //     if (source === 'consumer') {
    //         params = '?account=' + accountId;
    //     }
    //     const url = source + '/waitlist/' + uuid + params;
    //     return this.servicemeta.httpGet(url);
    // }
    // getTeleApptById(uuid, source, accountId?) {
    //     let params = '';
    //     if (source === 'consumer') {
    //         params = '?account=' + accountId;
    //     }
    //     const url = source + '/appointment/' + uuid + params;
    //     return this.servicemeta.httpGet(url);
    // }
    // getApptbyEncId(encId) {
    //     const url = 'consumer/appointment/enc/' + encId;
    //     return this.servicemeta.httpGet(url);
    // }
    // getOrderbyEncId(encId) {
    //     const url = 'consumer/orders/enc/' + encId;
    //     return this.servicemeta.httpGet(url);
    // }

    getTeleCheckinById(encId, source, accountId?) {
        let params = '';
        if (source === 'consumer') {
            params = '?account=' + accountId;
        }
        const url = 'consumer/waitlist/enc/' + encId + params;
        return this.servicemeta.httpGet(url);
    }
    getTeleApptById(encId, source, accountId?) {
        let params = '';
        if (source === 'consumer') {
            params = '?account=' + accountId;
        }
        const url = 'consumer/appointment/enc/' + encId + params;
        // const url = source + '/appointment/' + uuid + params;
        return this.servicemeta.httpGet(url);
    }

    getTeleBookingFromCheckIn(uid, source, accountId?) {
        return new Promise((resolve, reject) => {
            this.getTeleCheckinById(uid, source, accountId).subscribe(
                (bookingObj: any) => {
                    let token = '';
                    if (bookingObj.showToken) {
                        console.log(bookingObj.token);
                        if (bookingObj.token) {
                            token = bookingObj.token;
                        } else {
                            token = '1';
                        }

                    }
                    let bookingTime = '';
                    if (bookingObj.serviceTime) {
                        bookingTime = bookingObj.serviceTime;
                    }
                    let busName = "";
                    let busId = "";
                    let userId;
                    let userName;
                    if (bookingObj.provider) {
                        userName = bookingObj.provider.firstName + ' ' + bookingObj.provider.lastName;
                        userId = bookingObj.provider.id;
                        if (bookingObj.providerAccount && bookingObj.providerAccount.id) {
                            busId = bookingObj.providerAccount.id;
                        }
                    } else {
                        busName = bookingObj.providerAccount.businessName;
                        busId = bookingObj.providerAccount.id;
                    }
                    let consumerName = "";
                    if (bookingObj.waitlistingFor[0].firstName) {
                        consumerName = bookingObj.waitlistingFor[0].firstName;
                    }
                    if (bookingObj.waitlistingFor[0].lastName) {
                        consumerName += " " + bookingObj.waitlistingFor[0].lastName;
                    }
                    let teleMode = 'video';
                    if (bookingObj.service.virtualServiceType && bookingObj.service.virtualServiceType === 'audioService') {
                        teleMode = 'audio';
                    }
                    let teleUrl = '';
                    if (bookingObj.service.virtualCallingModes[0].callingMode !== 'VideoCall' && bookingObj.service.virtualCallingModes[0].callingMode !== 'WhatsApp') {
                        teleUrl = bookingObj.service.virtualCallingModes[0].value;
                    }
                    let bookingWindow = '';
                    bookingWindow = bookingObj.queue.queueStartTime + " - " +
                        bookingObj.queue.queueEndTime;

                    let bookingStatus = bookingObj.waitlistStatus;
                    if (bookingObj.waitlistStatus === 'started') {
                        bookingStatus = 'Doctor is waiting for you';
                    }
                    let btnLabel = 'Join Video Consultation';
                    if (bookingObj.videoCallMessage === 'Call in progress') {
                        btnLabel = 'Re-join Video Consultation';
                    }
                    let booking = new TeleBooking(bookingObj.date, bookingTime,
                        bookingWindow, token, bookingObj.checkinEncId, 'wl', bookingObj.service.name,
                        busName, busId, userName, userId, bookingObj.ynwUuid, bookingObj.service.virtualCallingModes[0].callingMode,
                        teleMode, teleUrl, bookingStatus, '', consumerName, bookingObj.queue.location.place,
                        bookingObj.queue.location.googleMapUrl, bookingObj.videoCallMessage, bookingObj.videoCallButton, btnLabel);
                    resolve(booking);
                }, (error) => {
                    reject(error);
                }
            )
        });
    }
    getTeleBookingFromAppt(uid, source, accountId?) {
        return new Promise((resolve, reject) => {
            this.getTeleApptById(uid, source, accountId).subscribe(
                (bookingObj: any) => {
                    let busName = "";
                    let busId = ""
                    let userName;
                    let userId;
                    if (bookingObj.provider) {
                        userName = bookingObj.provider.firstName + ' ' + bookingObj.provider.lastName;
                        userId = bookingObj.provider.id;
                        if (bookingObj.providerAccount && bookingObj.providerAccount.id) {
                            busId = bookingObj.providerAccount.id;
                        }
                    } else {
                        busName = bookingObj.providerAccount.businessName;
                        busId = bookingObj.providerAccount.id;
                    }
                    let consumerName = "";
                    if (bookingObj.appmtFor[0].firstName) {
                        consumerName = bookingObj.appmtFor[0].firstName;
                    }
                    if (bookingObj.appmtFor[0].lastName) {
                        consumerName += " " + bookingObj.appmtFor[0].lastName;
                    }
                    let teleMode = 'video';
                    if (bookingObj.service.virtualServiceType && bookingObj.service.virtualServiceType === 'audioService') {
                        teleMode = 'audio';
                    }
                    let teleUrl = '';
                    if (bookingObj.service.virtualCallingModes[0].callingMode !== 'VideoCall' && bookingObj.service.virtualCallingModes[0].callingMode !== 'WhatsApp') {
                        teleUrl = bookingObj.service.virtualCallingModes[0].value;
                    }
                    let bookingWindow = '';
                    bookingWindow = bookingObj.schedule.apptSchedule.timeSlots[0].sTime + " - " +
                        bookingObj.schedule.apptSchedule.timeSlots[0].eTime;
                    let bookingTime = this.getSingleTime(bookingObj.appmtTime);

                    let bookingStatus = bookingObj.apptStatus;

                    if (bookingObj.apptStatus === 'Started') {
                        bookingStatus = 'is waiting for you';
                    }
                    let btnLabel = 'Join Video Consultation';
                    if (bookingObj.videoCallMessage === 'Call in progress') {
                        btnLabel = 'Re-join Video Consultation';
                    }
                    let booking = new TeleBooking(bookingObj.appmtDate, bookingTime, '',
                        bookingWindow, bookingObj.appointmentEncId, 'appt', bookingObj.service.name,
                        busName, busId, userName, userId, bookingObj.uid, bookingObj.service.virtualCallingModes[0].callingMode,
                        teleMode, teleUrl, bookingStatus, '', consumerName, bookingObj.location.place,
                        bookingObj.location.googleMapUrl, bookingObj.videoCallMessage, bookingObj.videoCallButton, btnLabel);
                    resolve(booking);
                }, (error) => {
                    reject(error);
                }
            );
        });
    }
    getTeleNumber(phNo) {
        if (phNo) {
            if (phNo.lastIndexOf('+') === 0) {
                return phNo;
            } else if (phNo.lastIndexOf('+') === -1) {
                return '+' + phNo;
            } else {
                return phNo.substr(phNo.lastIndexOf('+'), phNo.length);
            }
        }
        console.log("Input Phone:", phNo);

    }
    getInvoiceDetailsByuuid(accId, uuid) {
        const url = 'consumer/booking/invoice/' + accId + '/booking/' + uuid;
        return this.servicemeta.httpGet(url);
    }
    setReadyState(bookingUID) {
        const url = 'consumer/videocall/notready/' + bookingUID;
        return this.servicemeta.httpPut(url);
    }
}

