import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MicrointeractionSelectorComponent } from './microinteraction-selector.component';

describe('MicrointeractionSelectorComponent', () => {
  let component: MicrointeractionSelectorComponent;
  let fixture: ComponentFixture<MicrointeractionSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MicrointeractionSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MicrointeractionSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
