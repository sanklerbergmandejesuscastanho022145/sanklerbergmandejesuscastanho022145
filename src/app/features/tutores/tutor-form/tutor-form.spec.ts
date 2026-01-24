// src/app/features/tutores/tutor-form/tutor-form.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TutorFormComponent } from './tutor-form';

describe('TutorFormComponent', () => {
  let component: TutorFormComponent;
  let fixture: ComponentFixture<TutorFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorFormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TutorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});