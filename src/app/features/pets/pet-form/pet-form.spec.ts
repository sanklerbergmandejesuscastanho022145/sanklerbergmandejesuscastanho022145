// src/app/features/pets/pet-form/pet-form.spec.ts
import '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PetFormComponent } from './pet-form';
import { ActivatedRoute, Router } from '@angular/router';
import { PetsService } from '../../../services/pets.service';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpEventType } from '@angular/common/http';

describe('PetFormComponent', () => {
  let component: PetFormComponent;
  let fixture: ComponentFixture<PetFormComponent>;
  let mockPetsService: any;
  let mockRouter: any;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    // Mock do PetsService
    mockPetsService = {
      criarPet: vi.fn().mockReturnValue(of({ id: 1, nome: 'Rex' })),
      atualizarPet: vi.fn().mockReturnValue(of({ id: 1, nome: 'Rex Atualizado' })),
      obterPetPorId: vi.fn().mockReturnValue(of({ 
        id: 1, 
        nome: 'Rex', 
        raca: 'Labrador',
        idade: 3,
        foto: { url: 'http://exemplo.com/foto.jpg' }
      })),
      uploadFotoPet: vi.fn().mockReturnValue(of({ 
        type: HttpEventType.Response,
        body: { fotoUrl: 'http://exemplo.com/foto.jpg' }
      }))
    };

    // Mock do Router
    mockRouter = {
      navigate: vi.fn()
    };

    // Mock do ActivatedRoute (modo cadastro - sem ID)
    mockActivatedRoute = {
      snapshot: {
        paramMap: { 
          get: vi.fn().mockReturnValue(null)
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [PetFormComponent, ReactiveFormsModule],
      providers: [
        { provide: PetsService, useValue: mockPetsService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PetFormComponent);
    component = fixture.componentInstance;
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve inicializar o formulário com campos vazios no modo cadastro', () => {
    fixture.detectChanges();
    expect(component.petForm.get('nome')?.value).toBe('');
    expect(component.petForm.get('especie')?.value).toBe('');
    expect(component.isEditMode).toBe(false);
  });

  it('deve validar campo nome como obrigatório', () => {
    fixture.detectChanges();
    const nomeControl = component.petForm.get('nome');
    nomeControl?.setValue('');
    expect(nomeControl?.hasError('required')).toBe(true);
  });

  it('deve validar campo nome com mínimo de 2 caracteres', () => {
    fixture.detectChanges();
    const nomeControl = component.petForm.get('nome');
    nomeControl?.setValue('A');
    expect(nomeControl?.hasError('minlength')).toBe(true);
  });

  it('deve validar espécie como obrigatória', () => {
    fixture.detectChanges();
    const especieControl = component.petForm.get('especie');
    especieControl?.setValue('');
    expect(especieControl?.hasError('required')).toBe(true);
  });

  it('deve validar idade como obrigatória', () => {
    fixture.detectChanges();
    const idadeControl = component.petForm.get('idade');
    idadeControl?.setValue(null);
    expect(idadeControl?.hasError('required')).toBe(true);
  });

  it('deve validar idade mínima como 0', () => {
    fixture.detectChanges();
    const idadeControl = component.petForm.get('idade');
    idadeControl?.setValue(-1);
    expect(idadeControl?.hasError('min')).toBe(true);
  });

  it('deve validar idade máxima como 50', () => {
    fixture.detectChanges();
    const idadeControl = component.petForm.get('idade');
    idadeControl?.setValue(51);
    expect(idadeControl?.hasError('max')).toBe(true);
  });

  it('deve processar upload de imagem corretamente', () => {
    fixture.detectChanges();
    const file = new File(['fake-content'], 'test.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [file] } } as any;
    
    component.onFileSelected(event);
    expect(component.selectedFile).toBe(file);
  });

  it('deve rejeitar imagem maior que 5MB', () => {
    fixture.detectChanges();
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [largeFile] } } as any;
    
    component.onFileSelected(event);
    expect(component.errorMessage).toContain('5MB');
  });

  it('deve rejeitar arquivo que não é imagem', () => {
    fixture.detectChanges();
    const file = new File(['fake-content'], 'test.txt', { type: 'text/plain' });
    const event = { target: { files: [file] } } as any;
    
    component.onFileSelected(event);
    expect(component.errorMessage).toContain('imagem válida');
  });

  it('deve remover foto corretamente', () => {
    fixture.detectChanges();
    component.selectedFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    component.fotoPreview = 'data:image/jpeg;base64,test';
    component.uploadProgress = 50;

    component.removePhoto();

    expect(component.selectedFile).toBeNull();
    expect(component.fotoPreview).toBeNull();
    expect(component.uploadProgress).toBe(0);
  });

  it('deve criar um novo pet sem foto com sucesso', async () => {
    fixture.detectChanges();
    component.petForm.patchValue({
      nome: 'Rex',
      especie: 'Cachorro',
      raca: 'Labrador',
      idade: 3
    });

    component.onSubmit();
    
    expect(mockPetsService.criarPet).toHaveBeenCalledWith({
      nome: 'Rex',
      especie: 'Cachorro',
      raca: 'Labrador',
      idade: 3
    });
  });

  it('não deve submeter formulário inválido', () => {
    fixture.detectChanges();
    component.petForm.patchValue({ nome: '' });
    
    component.onSubmit();
    expect(mockPetsService.criarPet).not.toHaveBeenCalled();
  });

  it('deve carregar dados do pet no modo edição', () => {
    mockActivatedRoute.snapshot.paramMap.get = vi.fn().mockReturnValue('1');
    
    component.ngOnInit();
    
    expect(component.petId).toBe(1);
    expect(component.isEditMode).toBe(true);
    expect(mockPetsService.obterPetPorId).toHaveBeenCalledWith(1);
  });

  it('deve atualizar pet existente com sucesso', () => {
    fixture.detectChanges();
    component.petId = 1;
    component.isEditMode = true;

    component.petForm.patchValue({
      nome: 'Rex Atualizado',
      especie: 'Cachorro',
      raca: 'Labrador',
      idade: 4
    });

    component.onSubmit();

    expect(mockPetsService.atualizarPet).toHaveBeenCalledWith(1, {
      nome: 'Rex Atualizado',
      especie: 'Cachorro',
      raca: 'Labrador',
      idade: 4
    });
  });

  it('deve tratar erro ao criar pet', () => {
    mockPetsService.criarPet.mockReturnValue(throwError(() => new Error('Erro ao criar')));
    fixture.detectChanges();

    component.petForm.patchValue({
      nome: 'Rex',
      especie: 'Cachorro',
      idade: 3
    });

    component.onSubmit();

    expect(component.errorMessage).toContain('Erro ao cadastrar pet');
  });

  it('deve cancelar e navegar para lista de pets', () => {
    fixture.detectChanges();
    component.onCancel();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/pets']);
  });

  it('deve tratar erro ao carregar dados do pet', () => {
    mockPetsService.obterPetPorId.mockReturnValue(throwError(() => new Error('Erro ao carregar')));
    mockActivatedRoute.snapshot.paramMap.get = vi.fn().mockReturnValue('1');

    component.ngOnInit();

    expect(component.errorMessage).toContain('Erro ao carregar dados do pet');
  });
});