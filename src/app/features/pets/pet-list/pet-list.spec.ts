// src/app/features/pets/pet-list/pet-list.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PetsListComponent } from './pet-list';

describe('PetListComponent', () => {
  let component: PetsListComponent;
  let fixture: ComponentFixture<PetsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PetsListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PetsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});