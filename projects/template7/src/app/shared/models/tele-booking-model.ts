import { Deserializable } from "./deserializable.model";

export class TeleBooking implements Deserializable {
    bookingDate: string;
    bookingTime: string;
    token: string;
    bookingWindow: string;
    encId: string;
    bookingType: string;
    service: string;
    userName: string;
    userId: string;
    businessName: string;
    businessId: string;
    id: string;
    teleMedia: string;
    teleMode: string;
    teleUrl: string;
    bookingStatus: string;
    description: string;
    bookingFor: string;
    location: string;
    mapUrl: string;
    videoStatus: string;
    btnStatus: string;
    btnLabel: string;

    constructor(bookingDate: string, bookingTime: string, bookingWindow: string, token: string, encId: string, bookingType: string,
        service: string, businessName: string, businessId: string, userName: string, userId: string, id: string, teleMedia: string, 
        teleMode: string, teleUrl: string, bookingStatus: string, description: string, bookingFor: string, location: string, 
        mapUrl: string, videoStatus: string, btnStatus: string, btnLabel: string) {
        this.bookingDate = bookingDate;
        this.bookingTime = bookingTime;
        this.bookingWindow = bookingWindow;
        this.encId = encId;
        this.bookingType = bookingType;
        this.service = service;
        this.userName = userName;
        this.userId = userId;
        this.businessName = businessName;
        this.businessId = businessId;
        this.id = id;
        this.teleMedia = teleMedia;
        this.teleMode = teleMode;
        this.bookingStatus = bookingStatus;
        this.description = description;
        this.bookingFor = bookingFor;
        this.teleUrl = teleUrl;
        this.location = location;
        this.mapUrl = mapUrl;
        this.token = token;
        this.videoStatus = videoStatus;
        this.btnStatus = btnStatus;
        this.btnLabel = btnLabel
    }

    deserialize(input: any) {
        Object.assign(this, input);
        return this;
    }
}