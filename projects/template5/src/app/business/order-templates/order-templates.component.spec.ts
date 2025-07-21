import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderTemplatesComponent } from './order-templates.component';

describe('OrderTemplatesComponent', () => {
  let component: OrderTemplatesComponent;
  let fixture: ComponentFixture<OrderTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderTemplatesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
