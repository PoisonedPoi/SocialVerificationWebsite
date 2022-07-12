import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractionCanvasComponent } from './interaction-canvas.component';

describe('InteractionCanvasComponent', () => {
  let component: InteractionCanvasComponent;
  let fixture: ComponentFixture<InteractionCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InteractionCanvasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InteractionCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
