import '../../../../test-setup';

// src/app/features/tutores/tutor-list/tutor-list.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TutorListComponent } from './tutor-list';

describe('TutorListComponent', () => {
  let component: TutorListComponent;
  let fixture: ComponentFixture<TutorListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TutorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});