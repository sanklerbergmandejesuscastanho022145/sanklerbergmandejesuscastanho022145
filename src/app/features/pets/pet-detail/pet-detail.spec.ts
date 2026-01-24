// src/app/features/pets/pet-detail/pet-detail.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PetDetailComponent } from './pet-detail';

describe('PetDetailComponent', () => {
  let component: PetDetailComponent;
  let fixture: ComponentFixture<PetDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PetDetailComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PetDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});