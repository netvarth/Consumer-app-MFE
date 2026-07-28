import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Booking, ChotaBossStateService, Provider, ServiceItem } from './chotaboss-state.service';
import { chotaBossAssetUrl } from './chotaboss-assets';

@Component({ selector: 'cb-header', template: `
  <header class="cb-header" [class.cb-header--orange]="orange">
    <button *ngIf="back" class="icon-button" type="button" aria-label="Go back" (click)="goBack()">←</button>
    <a *ngIf="logo" class="cb-logo" routerLink="../home" aria-label="ChotaBoss home">CH<span>O</span>TA<br>BO<span>SS</span></a>
    <h1 *ngIf="title">{{ title }}</h1><span class="header-spacer"></span>
    <ng-content></ng-content>
  </header>` })
export class AppHeaderComponent {
  @Input() title = ''; @Input() back = false; @Input() logo = false; @Input() orange = false;
  constructor(private readonly router: Router, private readonly route: ActivatedRoute) {}
  goBack(): void { history.length > 1 ? history.back() : void this.router.navigate(['../home'], { relativeTo: this.route }); }
}

@Component({ selector: 'cb-bottom-nav', template: `
  <nav class="bottom-nav" aria-label="Primary navigation">
    <a *ngFor="let tab of tabs" [routerLink]="tab.route" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
      <span aria-hidden="true">{{tab.icon}}</span><small>{{tab.label}}</small>
    </a>
  </nav>` })
export class BottomNavComponent {
  readonly tabs = [
    { label: 'Home', icon: '⌂', route: '../home' }, { label: 'Bookings', icon: '▦', route: '../bookings' },
    { label: 'Shop', icon: '♙', route: '../shop' }, { label: 'About Us', icon: '♣', route: '../about' }, { label: 'Support', icon: '♬', route: '../support' }
  ];
}

@Component({ selector: 'cb-home-page', template: `
  <main class="app-page home-page with-nav">
    <section class="home-top">
      <cb-header [logo]="true" [orange]="true"><button class="icon-button light" aria-label="Messages">•••</button><a class="icon-button light" routerLink="../support" aria-label="Profile">●</a></cb-header>
      <article class="hero-card"><div><span class="eyebrow">ONLINE CONSULTATIONS</span><h2>Healthy Pets. Happy Pets!</h2><p>Connect with certified vets<br>from home.</p><a class="primary small" routerLink="../locations">BOOK NOW</a></div><img [src]="assetUrl('home-hero-pets.png')" alt="Veterinarian with a dog and cat"></article>
    </section>
    <section class="page-pad">
      <div class="category-grid">
        <a routerLink="../locations"><img [src]="assetUrl('category-doctor.jpg')" alt="Veterinarian"><b>Book Doctor</b></a>
        <a routerLink="../locations"><img [src]="assetUrl('category-grooming.jpg')" alt="Pet grooming"><b>Grooming</b></a>
        <a routerLink="../shop"><img [src]="assetUrl('category-shop.jpg')" alt="Pet products"><b>Pet Store</b></a>
        <a class="soon"><img [src]="assetUrl('category-boarding.jpg')" alt="Pet boarding"><b>Boarding</b></a>
        <a class="soon"><img [src]="assetUrl('category-training.jpg')" alt="Pet training"><b>Training</b></a>
        <a class="soon"><img [src]="assetUrl('category-insurance.jpg')" alt="Pet insurance"><b>Insurance</b></a>
      </div>
      <div class="rebrand"><b>🐾 Jaldee Vets</b><span>is now</span><strong>CHOTA<br>BOSS</strong></div>
      <a *ngIf="state.booking as booking" class="upcoming-card" routerLink="../booking/details"><span>▣</span><div>Upcoming Appointment<b>{{booking.date}}, {{booking.time}}</b></div><i>›</i></a>
      <img class="promo-image" [src]="assetUrl('launch-offer.jpg')" alt="Launch offer: get 100 rupees off using code CHOTABOSS100">
    </section>
    <section class="love-section"><div class="paw-medallion">🐾</div><h2>Why Pet Parents Love Us</h2><p>Trusted care, right from your phone.</p>
      <div class="benefit wide"><i>🏅</i><div><b>Verified Vets</b><span>Consult licensed veterinary professionals with confidence.</span></div></div>
      <div class="benefit wide reverse"><div><b>Home Consultation</b><span>Get vet advice from the comfort of home.</span></div><i>🏠</i></div>
      <div class="benefit-pair"><div class="benefit"><i>📋</i><b>Digital Prescriptions</b><span>Prescriptions and recommendations stored digitally.</span></div><div class="benefit"><i>🔒</i><b>Safe & Secure</b><span>Your pet’s data stays private and protected.</span></div></div>
    </section>
    <section class="page-pad stats"><div><i>✿</i><span>500+ Pet<br>Appointments</span></div><div><i>♙</i><span>Multi Speciality<br>Veterinarians</span></div><div><i>♡</i><span>Holistic Pet<br>Healthcare</span></div></section>
    <section class="page-pad"><img class="promo-image" [src]="assetUrl('online-vet.jpg')" alt="Best in online vet care — book today"><h2 class="section-title">Explore Blogs</h2><div class="blog-row"><article *ngFor="let item of [1,2]"><img [src]="assetUrl('blog-dog.jpg')" alt="Dog resting beside a laptop"><b>Is Your Pet Trying to Tell You Something?</b><p>Your dog’s wagging tail, playful jumps, and endless loyalty ...</p><a href="#blog">Read More</a></article></div></section>
    <cb-bottom-nav></cb-bottom-nav>
  </main>` })
export class HomePageComponent { readonly assetUrl = chotaBossAssetUrl; constructor(public readonly state: ChotaBossStateService) {} }

@Component({ selector: 'cb-locations-page', template: `
  <main class="app-page"><cb-header title="Select Location" [back]="true"></cb-header>
    <div class="city-row" role="list"><button *ngFor="let city of state.cities" type="button" [class.active]="state.selectedCity===city.id" (click)="select(city.id)"><span>{{city.icon}}</span>{{city.name}}</button></div>
    <section *ngIf="state.selectedCity==='near'" class="near-state"><img [src]="assetUrl('location-dog.png')" alt="Dog helping locate nearby ChotaBoss stores"><h2>Looking for <em>us?</em></h2><p>Coming Soon to your Neighbourhood</p><button type="button" (click)="select('thrissur')">⌖ Find Other Locations</button></section>
    <section class="provider-list page-pad"><button *ngFor="let provider of state.providers" type="button" class="provider-card" (click)="open(provider)"><img [src]="provider.banner" [alt]="provider.name"><span class="timing">Timings: {{provider.timing}}</span><b>{{provider.name}}</b><div><em>⌖ {{provider.distance}}</em><strong>{{provider.rating}} ★</strong><i>→</i></div></button></section>
  </main>` })
export class LocationsPageComponent {
  readonly assetUrl = chotaBossAssetUrl;
  constructor(public readonly state: ChotaBossStateService, private readonly router: Router, private readonly route: ActivatedRoute) {}
  select(id: string): void { this.state.selectCity(id); }
  open(provider: Provider): void { this.state.selectProvider(provider); void this.router.navigate(['../provider', provider.id], { relativeTo: this.route }); }
}

@Component({ selector: 'cb-provider-page', template: `
  <main class="app-page"><cb-header [title]="state.selectedProvider.name" [back]="true"></cb-header><section class="provider-profile page-pad">
    <div class="provider-intro"><img [src]="state.selectedProvider.logo" [alt]="state.selectedProvider.name"><div><h2>{{state.selectedProvider.name}}</h2><span>⌖ {{state.selectedProvider.distance}}</span><p>{{state.selectedProvider.address}}</p></div></div>
    <div class="credential-row"><div>✪ <b>Verify</b><small>Certified</small></div><div>♟ <b>5 Years</b><small>Experience</small></div><div>★ <b>4.9</b><small>Rating</small></div></div></section>
    <div class="timing-bar"><b>◷ &nbsp; Timings: {{state.selectedProvider.timing}}</b><span>⌖ &nbsp; ☎</span></div>
    <section class="service-list page-pad"><article *ngFor="let service of state.services"><div><h3>{{service.name}}</h3><p>{{service.description}}</p><small>Starts at ₹{{service.price}}</small><span>♙ &nbsp; ₹100 Discount Available</span></div><div><img [src]="service.image" [alt]="service.name"><button type="button" (click)="book(service)">Book Now</button></div></article></section>
  </main>` })
export class ProviderPageComponent {
  constructor(public readonly state: ChotaBossStateService, private readonly router: Router, private readonly route: ActivatedRoute) {}
  book(service: ServiceItem): void { this.state.selectService(service); void this.router.navigate(['../book', service.id], { relativeTo: this.route }); }
}

@Component({ selector: 'cb-booking-page', template: `
  <main class="app-page action-page"><cb-header [title]="state.selectedProvider.name" [back]="true"></cb-header>
    <div class="booking-service"><b>{{state.selectedService.name}}</b><div class="segment" aria-label="Pet type"><button [class.active]="petType==='Dog'" (click)="petType='Dog'">Dog</button><button [class.active]="petType==='Cat'" (click)="petType='Cat'">Cat</button></div></div>
    <section class="page-pad"><b>Select Date & Time &nbsp; 📅</b><div class="date-row"><button *ngFor="let date of dates" [class.active]="selectedDate===date.full" (click)="selectedDate=date.full"><small>{{date.day}}</small><b>{{date.number}}</b></button></div><p class="notice">● &nbsp; Refundable Advance payment of ₹199 is applicable</p></section>
    <section *ngFor="let group of slotGroups" class="slot-section"><h3>{{group.icon}} &nbsp; {{group.name}}</h3><div><button *ngFor="let slot of group.slots" [class.active]="selectedTime===slot" (click)="selectedTime=slot">{{slot}}</button></div></section>
    <p *ngIf="error" class="form-error" role="alert">{{error}}</p><div class="sticky-action"><button class="primary" type="button" (click)="submit()">Book Consultation</button></div>
  </main>` })
export class BookingPageComponent {
  petType: 'Dog'|'Cat' = 'Dog'; selectedDate = '17 June 2026'; selectedTime = '12:00 PM'; error = '';
  readonly dates = [{day:'TUE',number:'16',full:'16 June 2026'},{day:'WED',number:'17',full:'17 June 2026'},{day:'THU',number:'18',full:'18 June 2026'},{day:'FRI',number:'19',full:'19 June 2026'},{day:'SAT',number:'20',full:'20 June 2026'}];
  readonly slotGroups = [{name:'Morning',icon:'☼',slots:['10:00 AM','11:00 AM']},{name:'Afternoon',icon:'☀',slots:['12:00 PM','2:00 PM','3:00 PM','4:00 PM']},{name:'Evening',icon:'☾',slots:['5:00 PM','6:00 PM']}];
  constructor(public readonly state: ChotaBossStateService, private readonly router: Router, private readonly route: ActivatedRoute) {}
  submit(): void { if (!this.selectedDate || !this.selectedTime) { this.error='Select a date and time slot to continue.'; return; } this.state.createBooking(this.petType,this.selectedDate,this.selectedTime); void this.router.navigate(['../booking/success'], { relativeTo: this.route }); }
}

@Component({ selector: 'cb-booking-success', template: `
  <main class="app-page success-page action-page" aria-live="polite"><section class="booking-success-head"><span>▣</span><div><h1>Your Booking is Success</h1><p>Service is confirmed.</p></div></section><section class="success-sheet" *ngIf="booking as item"><h2>Details Appointment</h2><div class="detail-card"><p><b>{{item.date}}</b><span>Appointment Date</span><i>▣</i></p><p><b>{{item.time}}</b><span>Appointment Time</span><i>◷</i></p><p><b>{{item.provider.name}}</b><span>Appointment Location</span><i>♙</i></p></div><div class="service-pill"><img [src]="item.service.image" alt=""><div><b>{{item.service.name}}</b><span>{{item.service.description}}</span></div></div></section><div class="sticky-action"><a class="primary" routerLink="../home">Back to Home</a></div></main>` })
export class BookingSuccessPageComponent { get booking(): Booking | null { return this.state.booking; } constructor(private readonly state: ChotaBossStateService) {} }

@Component({ selector: 'cb-booking-details', template: `
  <main class="app-page action-page"><cb-header title="Booking Details" [back]="true"></cb-header><ng-container *ngIf="booking as item; else empty"><section class="page-pad booking-detail"><div class="detail-card"><p><b>{{item.date}}</b><span>Appointment Date</span><i>▣</i></p><p><b>{{item.time}}</b><span>Appointment Time</span><i>◷</i></p><p><b>{{item.provider.name}}</b><span>Appointment Location</span><i>♙</i></p></div><div class="service-pill"><img [src]="item.service.image" alt=""><div><b>{{item.service.name}}</b><span>{{item.service.description}}</span></div></div></section><hr><section class="page-pad"><span class="label">Service Provider:</span><div class="provider-intro"><img [src]="item.provider.logo" alt=""><div><h2>{{item.provider.name}}</h2><span>⌖ {{item.provider.distance}}</span><p>{{item.provider.address}}</p></div></div></section><div class="sticky-action"><button class="primary">Invoice Details</button></div></ng-container><ng-template #empty><section class="empty-state"><h2>No upcoming booking</h2><a class="primary" routerLink="../locations">Book an appointment</a></section></ng-template></main>` })
export class BookingDetailsPageComponent { get booking(): Booking | null { return this.state.booking; } constructor(private readonly state: ChotaBossStateService) {} }

@Component({ selector: 'cb-static-page', template: `<main class="app-page with-nav"><cb-header [title]="title" [back]="true"></cb-header><section class="empty-state"><div class="empty-icon">🐾</div><h2>{{title}}</h2><p>{{message}}</p><a class="primary" routerLink="../home">Back to Home</a></section><cb-bottom-nav></cb-bottom-nav></main>` })
export class StaticPageComponent {
  @Input() title='ChotaBoss'; @Input() message='Care for every pet, every day.';
  constructor(route: ActivatedRoute) { this.title = route.snapshot.data['title'] ?? this.title; this.message = route.snapshot.data['message'] ?? this.message; }
}
