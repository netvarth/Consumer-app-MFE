import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallbacklistCardComponent } from './callbacklist-card.component';

describe('CallbacklistCardComponent', () => {
  let component: CallbacklistCardComponent;
  let fixture: ComponentFixture<CallbacklistCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CallbacklistCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CallbacklistCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
