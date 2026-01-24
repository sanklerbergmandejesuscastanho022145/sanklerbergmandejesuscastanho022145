// src/app/features/pets/pet-form/pet-form.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PetFormComponent } from './pet-form';
import { PetsService } from '../../../services/pets.service';
import { TutorService } from '../../../services/tutor.service';

describe('PetFormComponent', () => {
  let component: PetFormComponent;
  let fixture: ComponentFixture<PetFormComponent>;
  let petsServiceSpy: jasmine.SpyObj<PetsService>;
  let tutorServiceSpy: jasmine.SpyObj<TutorService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Criando mocks dos serviços
    petsServiceSpy = jasmine.createSpyObj('PetsService', [
      'criarPet',
      'atualizarPet',
      'obterPetPorId',
      'uploadFotoPet'
    ]);

    tutorServiceSpy = jasmine.createSpyObj('TutorService', ['listarTutores']);
    tutorServiceSpy.listarTutores.and.returnValue(of([]));

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [PetFormComponent, ReactiveFormsModule],
      providers: [
        { provide: PetsService, useValue: petsServiceSpy },
        { provide: TutorService, useValue: tutorServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PetFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve inicializar o formulário com campos vazios', () => {
    expect(component.petForm.get('nome')?.value).toBe('');
    expect(component.petForm.get('especie')?.value).toBe('');
    expect(component.petForm.get('raca')?.value).toBe('');
    expect(component.petForm.get('idade')?.value).toBeNull();
  });

  it('deve validar campo nome como obrigatório', () => {
    const nomeControl = component.petForm.get('nome');
    
    nomeControl?.setValue('');
    expect(nomeControl?.hasError('required')).toBe(true);

    nomeControl?.setValue('Rex');
    expect(nomeControl?.hasError('required')).toBe(false);
  });

  it('deve validar espécie como obrigatória', () => {
    const especieControl = component.petForm.get('especie');
    
    especieControl?.setValue('');
    expect(especieControl?.hasError('required')).toBe(true);

    especieControl?.setValue('Cachorro');
    expect(especieControl?.hasError('required')).toBe(false);
  });

  it('deve validar idade como número positivo', () => {
    const idadeControl = component.petForm.get('idade');
    
    idadeControl?.setValue(-1);
    expect(idadeControl?.hasError('min')).toBe(true);

    idadeControl?.setValue(0);
    expect(idadeControl?.hasError('min')).toBe(true);

    idadeControl?.setValue(5);
    expect(idadeControl?.valid).toBe(true);
  });

  it('deve processar upload de imagem corretamente', () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB

    const event = {
      target: {
        files: [file]
      }
    } as any;

    component.onFileSelected(event);
    expect(component.onFileSelected).toBe(file);
  });

  it('deve rejeitar imagem maior que 5MB', () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 }); // 6MB

    const event = {
      target: {
        files: [file]
      }
    } as any;

    spyOn(window, 'alert');
    component.onFileSelected(event);
    
    expect(window.alert).toHaveBeenCalledWith('A imagem deve ter no máximo 5MB');
    expect(component.onFileSelected).toBeNull();
  });

  it('deve criar um novo pet com sucesso', (done) => {
    const mockPet = {
      id: 1,
      nome: 'Rex',
      raca: 'Labrador',
      idade: 3
    };

    petsServiceSpy.criarPet.and.returnValue(of(mockPet));

    component.petForm.patchValue({
      nome: 'Rex',
      especie: 'Cachorro',
      raca: 'Labrador',
      idade: 3,
      tutorId: 1
    });

    component.onSubmit();

    setTimeout(() => {
      expect(petsServiceSpy.criarPet).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/pets']);
      done();
    }, 100);
  });

  it('deve atualizar um pet existente', (done) => {
    component.petId = 1;
    const mockPet = {
      id: 1,
      nome: 'Rex Atualizado',
      raca: 'Labrador',
      idade: 4
    };

    petsServiceSpy.atualizarPet.and.returnValue(of(mockPet));

    component.petForm.patchValue({
      nome: 'Rex Atualizado',
      especie: 'Cachorro',
      raca: 'Labrador',
      idade: 4,
      tutorId: 1
    });

    component.onSubmit();

    setTimeout(() => {
      expect(petsServiceSpy.atualizarPet).toHaveBeenCalledWith(1, jasmine.any(Object));
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/pets']);
      done();
    }, 100);
  });

  it('deve tratar erro ao criar pet', (done) => {
    petsServiceSpy.criarPet.and.returnValue(
      throwError(() => new Error('Erro ao criar pet'))
    );

    spyOn(window, 'alert');

    component.petForm.patchValue({
      nome: 'Rex',
      especie: 'Cachorro',
      raca: 'Labrador',
      idade: 3,
      tutorId: 1
    });

    component.onSubmit();

    setTimeout(() => {
      expect(window.alert).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('não deve submeter formulário inválido', () => {
    component.petForm.patchValue({
      nome: '',
      especie: '',
      raca: '',
      idade: null
    });

    component.onSubmit();

    expect(petsServiceSpy.criarPet).not.toHaveBeenCalled();
    expect(petsServiceSpy.atualizarPet).not.toHaveBeenCalled();
  });

  it('deve cancelar e navegar para lista de pets', () => {
    component.onCancel();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/pets']);
  });

  it('deve rejeitar arquivo que não é imagem', () => {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    const event = {
      target: {
        files: [file]
      }
    } as any;

    spyOn(window, 'alert');
    component.onFileSelected(event);
    
    expect(window.alert).toHaveBeenCalledWith('Por favor, selecione apenas imagens (JPG, PNG, GIF)');
    expect(component.onFileSelected).toBeNull();
  });
});