import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IvrConfirmComponent } from './ivr-confirm.component';

describe('IvrConfirmComponent', () => {
  let component: IvrConfirmComponent;
  let fixture: ComponentFixture<IvrConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IvrConfirmComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IvrConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
