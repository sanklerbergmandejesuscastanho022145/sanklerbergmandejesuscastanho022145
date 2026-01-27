// src/app/features/tutores/tutor-form/tutor-form.spec.ts
import '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TutorFormComponent } from './tutor-form';
import { ActivatedRoute, Router } from '@angular/router';
import { TutorService } from '../../../services/tutor.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HttpEventType } from '@angular/common/http';

describe('TutorFormComponent', () => {
  let component: TutorFormComponent;
  let fixture: ComponentFixture<TutorFormComponent>;
  let mockTutorService: any;
  let mockRouter: any;
  let mockActivatedRoute: any;

  const mockFoto = {
    id: 1,
    nome: 'foto-tutor.jpg',
    url: 'http://exemplo.com/foto.jpg',
    contentType: 'image/jpeg'
  };

  beforeEach(async () => {
    // Mock do TutorService
    mockTutorService = {
      criarTutor: vi.fn().mockReturnValue(of({ 
        id: 1, 
        nome: 'João Silva',
        telefone: '(11) 98765-4321',
        endereco: 'Rua Test, 123',
        email: 'joao@test.com',
        cpf: '123.456.789-00'
      })),
      atualizarTutor: vi.fn().mockReturnValue(of({ 
        id: 1, 
        nome: 'João Silva Atualizado',
        telefone: '(11) 98765-4321',
        endereco: 'Rua Test, 456',
        email: 'joao@test.com',
        cpf: '123.456.789-00'
      })),
      obterTutorPorId: vi.fn().mockReturnValue(of({ 
        id: 1, 
        nome: 'João Silva',
        telefone: '(11) 98765-4321',
        endereco: 'Rua Test, 123',
        email: 'joao@test.com',
        cpf: '123.456.789-00',
        foto: mockFoto
      })),
      uploadFotoTutor: vi.fn().mockReturnValue(of({ 
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
      imports: [TutorFormComponent, FormsModule],
      providers: [
        { provide: TutorService, useValue: mockTutorService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TutorFormComponent);
    component = fixture.componentInstance;
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve inicializar com tutor vazio no modo cadastro', () => {
    fixture.detectChanges();
    expect(component.tutor.nome).toBe('');
    expect(component.tutor.telefone).toBe('');
    expect(component.tutor.endereco).toBe('');
    expect(component.isEditMode).toBe(false);
  });

  it('deve carregar dados do tutor no modo edição', () => {
    mockActivatedRoute.snapshot.paramMap.get = vi.fn().mockReturnValue('1');
    
    component.ngOnInit();
    
    expect(component.tutorId).toBe('1');
    expect(component.isEditMode).toBe(true);
    expect(mockTutorService.obterTutorPorId).toHaveBeenCalledWith('1');
  });

  it('deve validar nome obrigatório', () => {
    fixture.detectChanges();
    component.tutor.nome = '';
    component.tutor.telefone = '(11) 98765-4321';
    component.tutor.endereco = 'Rua Test, 123';
    
    component.salvar();
    
    expect(component.errorMessage).toContain('Nome é obrigatório');
    expect(mockTutorService.criarTutor).not.toHaveBeenCalled();
  });

  it('deve validar telefone obrigatório', () => {
    fixture.detectChanges();
    component.tutor.nome = 'João Silva';
    component.tutor.telefone = '';
    component.tutor.endereco = 'Rua Test, 123';
    
    component.salvar();
    
    expect(component.errorMessage).toContain('Telefone é obrigatório');
    expect(mockTutorService.criarTutor).not.toHaveBeenCalled();
  });

  it('deve validar endereço obrigatório', () => {
    fixture.detectChanges();
    component.tutor.nome = 'João Silva';
    component.tutor.telefone = '(11) 98765-4321';
    component.tutor.endereco = '';
    
    component.salvar();
    
    expect(component.errorMessage).toContain('Endereço é obrigatório');
    expect(mockTutorService.criarTutor).not.toHaveBeenCalled();
  });

  it('deve criar um novo tutor sem foto com sucesso', () => {
    fixture.detectChanges();
    component.tutor = {
      nome: 'João Silva',
      telefone: '(11) 98765-4321',
      endereco: 'Rua Test, 123',
      email: 'joao@test.com',
      cpf: '123.456.789-00'
    };

    component.salvar();
    
    expect(mockTutorService.criarTutor).toHaveBeenCalledWith(component.tutor);
    expect(component.successMessage).toContain('criado com sucesso');
  });

  it('deve atualizar tutor existente com sucesso', () => {
    fixture.detectChanges();
    component.tutorId = '1';
    component.isEditMode = true;
    component.tutor = {
      id: 1,
      nome: 'João Silva Atualizado',
      telefone: '(11) 98765-4321',
      endereco: 'Rua Test, 456',
      email: 'joao@test.com',
      cpf: '123.456.789-00'
    };

    component.salvar();

    expect(mockTutorService.atualizarTutor).toHaveBeenCalledWith(1, component.tutor);
    expect(component.successMessage).toContain('atualizado com sucesso');
  });

  it('deve processar upload de imagem corretamente', () => {
    fixture.detectChanges();
    const file = new File(['fake-content'], 'test.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [file] } } as any;
    
    component.onFileSelected(event);
    
    expect(component.fotoSelecionada).toBe(file);
  });

  it('deve rejeitar imagem maior que 5MB', () => {
    fixture.detectChanges();
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [largeFile] } } as any;
    
    component.onFileSelected(event);
    
    expect(component.errorMessage).toContain('Tamanho máximo: 5MB');
    expect(component.fotoSelecionada).toBeNull();
  });

  it('deve rejeitar formato de arquivo não suportado', () => {
    fixture.detectChanges();
    const file = new File(['fake-content'], 'test.txt', { type: 'text/plain' });
    const event = { target: { files: [file] } } as any;
    
    component.onFileSelected(event);
    
    expect(component.errorMessage).toContain('Formato de arquivo não suportado');
    expect(component.fotoSelecionada).toBeNull();
  });

  it('deve aceitar formatos de imagem válidos (JPEG, PNG, GIF)', () => {
    fixture.detectChanges();
    
    const formats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    
    formats.forEach(format => {
      const file = new File(['fake-content'], 'test.' + format.split('/')[1], { type: format });
      const event = { target: { files: [file] } } as any;
      
      component.onFileSelected(event);
      
      expect(component.fotoSelecionada).toBe(file);
      expect(component.errorMessage).toBe('');
    });
  });

  it('deve remover foto corretamente', () => {
    fixture.detectChanges();
    component.fotoSelecionada = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    component.fotoPreview = 'data:image/jpeg;base64,test';
    component.tutor.foto = {
      id: 1,
      nome: 'foto-original.jpg',
      url: 'http://exemplo.com/foto-original.jpg',
      contentType: 'image/jpeg'
    };

    // Mock do elemento DOM
    const mockInput = document.createElement('input');
    mockInput.id = 'fotoInput';
    mockInput.value = 'test.jpg';
    document.body.appendChild(mockInput);

    component.removerFoto();

    expect(component.fotoSelecionada).toBeNull();
    expect(component.fotoPreview).toBe('http://exemplo.com/foto-original.jpg');
    expect(mockInput.value).toBe('');
    
    // Cleanup
    document.body.removeChild(mockInput);
  });

  it('deve formatar telefone corretamente com 10 dígitos', () => {
    fixture.detectChanges();
    component.tutor.telefone = '1198765432';
    
    component.formatarTelefone();
    
    expect(component.tutor.telefone).toBe('(11) 9876-5432');
  });

  it('deve formatar telefone corretamente com 11 dígitos', () => {
    fixture.detectChanges();
    component.tutor.telefone = '11987654321';
    
    component.formatarTelefone();
    
    expect(component.tutor.telefone).toBe('(11) 98765-4321');
  });

  it('deve remover caracteres não numéricos ao formatar telefone', () => {
    fixture.detectChanges();
    component.tutor.telefone = '(11) 98765-4321';
    
    component.formatarTelefone();
    
    expect(component.tutor.telefone).toBe('(11) 98765-4321');
  });

  it('deve formatar CPF corretamente', () => {
    fixture.detectChanges();
    component.tutor.cpf = '12345678900';
    
    component.formatarCPF();
    
    expect(component.tutor.cpf).toBe('123.456.789-00');
  });

  it('deve remover caracteres não numéricos ao formatar CPF', () => {
    fixture.detectChanges();
    component.tutor.cpf = '123.456.789-00';
    
    component.formatarCPF();
    
    expect(component.tutor.cpf).toBe('123.456.789-00');
  });

  it('não deve formatar CPF se estiver vazio', () => {
    fixture.detectChanges();
    component.tutor.cpf = '';
    
    component.formatarCPF();
    
    expect(component.tutor.cpf).toBe('');
  });

  it('deve fazer upload de foto após salvar tutor com sucesso', () => {
    fixture.detectChanges();
    const file = new File(['fake-content'], 'test.jpg', { type: 'image/jpeg' });
    component.fotoSelecionada = file;
    component.tutor = {
      nome: 'João Silva',
      telefone: '(11) 98765-4321',
      endereco: 'Rua Test, 123',
      email: 'joao@test.com',
      cpf: '123.456.789-00'
    };

    component.salvar();

    expect(mockTutorService.criarTutor).toHaveBeenCalled();
    expect(mockTutorService.uploadFotoTutor).toHaveBeenCalledWith('1', file);
  });

  it('deve tratar erro ao carregar tutor', () => {
    mockTutorService.obterTutorPorId.mockReturnValue(throwError(() => new Error('Erro ao carregar')));
    mockActivatedRoute.snapshot.paramMap.get = vi.fn().mockReturnValue('1');

    component.ngOnInit();

    expect(component.errorMessage).toContain('Erro ao carregar dados do tutor');
    expect(component.loading).toBe(false);
  });

  it('deve tratar erro ao salvar tutor', () => {
    mockTutorService.criarTutor.mockReturnValue(throwError(() => new Error('Erro ao salvar')));
    fixture.detectChanges();

    component.tutor = {
      nome: 'João Silva',
      telefone: '(11) 98765-4321',
      endereco: 'Rua Test, 123',
      email: 'joao@test.com',
      cpf: '123.456.789-00'
    };

    component.salvar();

    expect(component.errorMessage).toContain('Erro ao salvar tutor');
    expect(component.loading).toBe(false);
  });

  it('deve tratar erro ao fazer upload de foto', () => {
    mockTutorService.uploadFotoTutor.mockReturnValue(throwError(() => new Error('Erro no upload')));
    fixture.detectChanges();

    const file = new File(['fake-content'], 'test.jpg', { type: 'image/jpeg' });
    component.fotoSelecionada = file;

    component.uploadFoto('1');

    expect(component.errorMessage).toContain('Erro ao fazer upload da foto');
    expect(component.isUploading).toBe(false);
    expect(component.loading).toBe(false);
  });

  it('deve atualizar progresso de upload', () => {
    const progressEvent = {
      type: HttpEventType.UploadProgress,
      loaded: 50,
      total: 100
    };
    
    mockTutorService.uploadFotoTutor.mockReturnValue(of(progressEvent));
    fixture.detectChanges();

    const file = new File(['fake-content'], 'test.jpg', { type: 'image/jpeg' });
    component.uploadFoto('1');

    expect(component.uploadProgress).toBe(50);
  });

  it('deve cancelar e navegar para lista de tutores no modo cadastro', () => {
    fixture.detectChanges();
    component.isEditMode = false;
    
    component.cancelar();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/tutores']);
  });

  it('deve cancelar e navegar para detalhes do tutor no modo edição', () => {
    fixture.detectChanges();
    component.isEditMode = true;
    component.tutorId = '1';
    
    component.cancelar();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/tutores', '1']);
  });

  it('não deve entrar em modo edição se ID for "novo"', () => {
    mockActivatedRoute.snapshot.paramMap.get = vi.fn().mockReturnValue('novo');
    
    component.ngOnInit();
    
    expect(component.isEditMode).toBe(false);
    expect(mockTutorService.obterTutorPorId).not.toHaveBeenCalled();
  });

  it('deve carregar preview de foto ao carregar tutor', () => {
    mockActivatedRoute.snapshot.paramMap.get = vi.fn().mockReturnValue('1');
    
    component.ngOnInit();
    
    expect(component.fotoPreview).toBe('http://exemplo.com/foto.jpg');
  });
});