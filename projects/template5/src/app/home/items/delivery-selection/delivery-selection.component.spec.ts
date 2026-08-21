import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliverySelectionComponent } from './delivery-selection.component';

describe('DeliverySelectionComponent', () => {
  let component: DeliverySelectionComponent;
  let fixture: ComponentFixture<DeliverySelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliverySelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliverySelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
