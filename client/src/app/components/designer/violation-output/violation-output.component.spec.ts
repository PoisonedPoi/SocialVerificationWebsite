import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViolationOutputComponent } from './violation-output.component';

describe('ViolationOutputComponent', () => {
  let component: ViolationOutputComponent;
  let fixture: ComponentFixture<ViolationOutputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViolationOutputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViolationOutputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
