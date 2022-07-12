import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractionOptionsComponent } from './interaction-options.component';

describe('InteractionOptionsComponent', () => {
  let component: InteractionOptionsComponent;
  let fixture: ComponentFixture<InteractionOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InteractionOptionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InteractionOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
