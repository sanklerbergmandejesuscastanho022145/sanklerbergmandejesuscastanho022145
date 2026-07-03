import '../../test-setup';

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TutorService, Tutor, PaginatedResponse, Foto } from './tutor.service';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('TutorService', () => {
  let service: TutorService;
  let httpMock: HttpTestingController;
  const API_URL = 'https://pet-manager-api.geia.vip';

  const mockFoto: Foto = {
    id: 1,
    nome: 'foto-tutor.jpg',
    contentType: 'image/jpeg',
    url: 'https://example.com/foto-tutor.jpg'
  };

  const mockTutor: Tutor = {
    id: 1,
    nome: 'João Silva',
    email: 'joao@email.com',
    telefone: '11999999999',
    endereco: 'Rua das Flores, 123',
    cpf: '12345678901',
    foto: mockFoto,
    pets: []
  };

  const mockTutores: Tutor[] = [
    mockTutor,
    {
      id: 2,
      nome: 'Maria Santos',
      email: 'maria@email.com',
      telefone: '11988888888',
      endereco: 'Av. Principal, 456',
      cpf: '98765432100',
      foto: null,
      pets: []
    }
  ];

  const mockPaginatedResponse: PaginatedResponse<Tutor> = {
    page: 0,
    size: 10,
    total: 2,
    pageCount: 1,
    content: mockTutores
  };

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('access_token', 'fake-jwt-token');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TutorService]
    });

    service = TestBed.inject(TutorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('listarTutores', () => {
    it('should return an array of tutores from paginated response', () => {
      service.listarTutores().subscribe({
        next: (tutores) => {
          expect(tutores).toEqual(mockTutores);
          expect(tutores.length).toBe(2);
          expect(tutores[0].nome).toBe('João Silva');
          expect(tutores[1].nome).toBe('Maria Santos');
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer fake-jwt-token');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');

      req.flush(mockPaginatedResponse);
    });

    it('should extract content from paginated response correctly', () => {
      service.listarTutores().subscribe({
        next: (tutores) => {
          expect(Array.isArray(tutores)).toBe(true);
          expect(tutores).toEqual(mockPaginatedResponse.content);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores`);
      req.flush(mockPaginatedResponse);
    });

    it('should handle empty content array', () => {
      const emptyResponse: PaginatedResponse<Tutor> = {
        page: 0,
        size: 10,
        total: 0,
        pageCount: 0,
        content: []
      };

      service.listarTutores().subscribe({
        next: (tutores) => {
          expect(tutores).toEqual([]);
          expect(tutores.length).toBe(0);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores`);
      req.flush(emptyResponse);
    });

    it('should handle 401 unauthorized error', () => {
      service.listarTutores().subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should include authorization token in headers', () => {
      service.listarTutores().subscribe();

      const req = httpMock.expectOne(`${API_URL}/v1/tutores`);
      expect(req.request.headers.has('Authorization')).toBe(true);
      expect(req.request.headers.get('Authorization')).toBe('Bearer fake-jwt-token');

      req.flush(mockPaginatedResponse);
    });

    it('should log error and rethrow on failure', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      service.listarTutores().subscribe({
        error: (error) => {
          expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao buscar tutores:', error);
          consoleErrorSpy.mockRestore();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores`);
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('obterTutorPorId', () => {
    it('should return a single tutor by id', () => {
      service.obterTutorPorId('1').subscribe({
        next: (tutor) => {
          expect(tutor).toEqual(mockTutor);
          expect(tutor.id).toBe(1);
          expect(tutor.nome).toBe('João Silva');
          expect(tutor.email).toBe('joao@email.com');
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores/1`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer fake-jwt-token');

      req.flush(mockTutor);
    });

    it('should handle 404 when tutor not found', () => {
      service.obterTutorPorId('999').subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores/999`);
      req.flush('Tutor not found', { status: 404, statusText: 'Not Found' });
    });

    it('should return tutor without foto', () => {
      const tutorSemFoto: Tutor = { ...mockTutor, foto: null };

      service.obterTutorPorId('1').subscribe({
        next: (tutor) => {
          expect(tutor.foto).toBeNull();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores/1`);
      req.flush(tutorSemFoto);
    });

    it('should return tutor with pets', () => {
      const tutorComPets: Tutor = {
        ...mockTutor,
        pets: [
          { id: 1, nome: 'Rex', raca: 'Labrador', idade: 3 },
          { id: 2, nome: 'Luna', raca: 'Poodle', idade: 2 }
        ]
      };

      service.obterTutorPorId('1').subscribe({
        next: (tutor) => {
          expect(tutor.pets).toBeDefined();
          expect(tutor.pets?.length).toBe(2);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores/1`);
      req.flush(tutorComPets);
    });

    it('should log error and rethrow on failure', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      service.obterTutorPorId('1').subscribe({
        error: (error) => {
          expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao buscar tutor:', error);
          consoleErrorSpy.mockRestore();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores/1`);
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('criarTutor', () => {
    it('should create a new tutor', () => {
      const novoTutor: Tutor = {
        nome: 'Pedro Costa',
        email: 'pedro@email.com',
        telefone: '11977777777',
        endereco: 'Rua Nova, 789',
        cpf: '11122233344'
      };

      const tutorCriado: Tutor = { ...novoTutor, id: 3 };

      service.criarTutor(novoTutor).subscribe({
        next: (tutor) => {
          expect(tutor).toEqual(tutorCriado);
          expect(tutor.id).toBe(3);
          expect(tutor.nome).toBe('Pedro Costa');
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(novoTutor);
      expect(req.request.headers.get('Authorization')).toBe('Bearer fake-jwt-token');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');

      req.flush(tutorCriado);
    });

    it('should handle validation error when creating tutor', () => {
      const tutorInvalido: Tutor = { nome: '', email: 'invalid-email', telefone: '', endereco: '' };

      service.criarTutor(tutorInvalido).subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores`);
      req.flush('Validation error', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle duplicate CPF error', () => {
      const tutorDuplicado: Tutor = {
        nome: 'João Silva',
        email: 'outro@email.com',
        telefone: '11999999999',
        endereco: 'Rua X',
        cpf: '12345678901'
      };

      service.criarTutor(tutorDuplicado).subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(409);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores`);
      req.flush('CPF already exists', { status: 409, statusText: 'Conflict' });
    });

    it('should log error and rethrow on failure', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      service.criarTutor({ nome: 'Test', telefone: '', endereco: '' }).subscribe({
        error: (error) => {
          expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao criar tutor:', error);
          consoleErrorSpy.mockRestore();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores`);
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('atualizarTutor', () => {
    it('should update an existing tutor', () => {
      const tutorAtualizado: Tutor = {
        id: 1,
        nome: 'João Silva Updated',
        email: 'joao.novo@email.com',
        telefone: '11999999999',
        endereco: 'Rua Atualizada, 123',
        cpf: '12345678901'
      };

      service.atualizarTutor(1, tutorAtualizado).subscribe({
        next: (tutor) => {
          expect(tutor).toEqual(tutorAtualizado);
          expect(tutor.nome).toBe('João Silva Updated');
          expect(tutor.email).toBe('joao.novo@email.com');
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(tutorAtualizado);
      expect(req.request.headers.get('Authorization')).toBe('Bearer fake-jwt-token');

      req.flush(tutorAtualizado);
    });

    it('should handle 404 when updating non-existent tutor', () => {
      const tutorAtualizado: Tutor = { nome: 'Inexistente', telefone: '', endereco: '' };

      service.atualizarTutor(999, tutorAtualizado).subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores/999`);
      req.flush('Tutor not found', { status: 404, statusText: 'Not Found' });
    });

    it('should update tutor with partial data', () => {
      const tutorParcial: Tutor = { nome: 'João', telefone: '11966666666', endereco: 'Rua X' };

      service.atualizarTutor(1, tutorParcial).subscribe({
        next: (tutor) => {
          expect(tutor.telefone).toBe('11966666666');
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores/1`);
      req.flush({ ...mockTutor, telefone: '11966666666' });
    });

    it('should log error and rethrow on failure', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      service.atualizarTutor(1, { nome: 'Test', telefone: '', endereco: '' }).subscribe({
        error: (error) => {
          expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao atualizar tutor:', error);
          consoleErrorSpy.mockRestore();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores/1`);
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('uploadFotoTutor', () => {
    it('should upload tutor photo successfully', () => {
      const file = new File(['fake content'], 'tutor-photo.jpg', { type: 'image/jpeg' });
      const tutorId = '1';

      service.uploadFotoTutor(tutorId, file).subscribe({
        next: (event) => {
          if (event.type === HttpEventType.Response) {
            expect(event.body).toBeTruthy();
          }
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores/${tutorId}/fotos`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe('Bearer fake-jwt-token');
      expect(req.request.headers.has('Content-Type')).toBe(false);
      expect(req.request.body instanceof FormData).toBe(true);
      expect(req.request.reportProgress).toBe(true);

      req.flush({ success: true, foto: mockFoto });
    });

    it('should handle upload error', () => {
      const file = new File(['fake content'], 'tutor-photo.jpg', { type: 'image/jpeg' });

      const promise = new Promise<void>((resolve, reject) => {
        service.uploadFotoTutor('1', file).subscribe({
          next: () => {},
          error: (error: HttpErrorResponse) => {
            try {
              expect(error.status).toBe(500); 
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          complete: () => {
            resolve();
          }
        });
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores/1/fotos`);
      req.flush(
        { message: 'Upload failed' },
        { status: 500, statusText: 'Internal Server Error' }
      );

      return promise;
    });

    it('should include FormData with foto field', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      service.uploadFotoTutor('1', file).subscribe();

      const req = httpMock.expectOne(`${API_URL}/v1/tutores/1/fotos`);
      const formData = req.request.body as FormData;

      expect(formData.get('foto')).toBeTruthy();
      expect((formData.get('foto') as File).name).toBe('test.jpg');

      req.flush({ success: true });
    });

    it('should log error and rethrow on upload failure', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      service.uploadFotoTutor('1', file).subscribe({
        error: (error) => {
          expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao fazer upload da foto:', error);
          consoleErrorSpy.mockRestore();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores/1/fotos`);
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('deletarTutor', () => {
    it('should delete a tutor by id', () => {
      service.deletarTutor('1').subscribe({
        next: (response) => {
          expect(response).toBeNull();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores/1`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('Authorization')).toBe('Bearer fake-jwt-token');

      req.flush(null);
    });

    it('should handle 404 when deleting non-existent tutor', () => {
      service.deletarTutor('999').subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores/999`);
      req.flush('Tutor not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle constraint violation when tutor has pets', () => {
      service.deletarTutor('1').subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(409);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores/1`);
      req.flush('Cannot delete tutor with pets', { status: 409, statusText: 'Conflict' });
    });

    it('should log error and rethrow on failure', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      service.deletarTutor('1').subscribe({
        error: (error) => {
          expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao deletar tutor:', error);
          consoleErrorSpy.mockRestore();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores/1`);
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('vincularPet', () => {
    it('should link a pet to a tutor', () => {
      const tutorId = '1';
      const petId = '5';

      service.vincularPet(tutorId, petId).subscribe({
        next: (response) => {
          expect(response).toBeNull();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores/${tutorId}/pets/${petId}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe('Bearer fake-jwt-token');
      expect(req.request.body).toEqual({});

      req.flush(null);
    });

    it('should handle 404 when tutor not found', () => {
      service.vincularPet('999', '1').subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores/999/pets/1`);
      req.flush('Tutor not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle 404 when pet not found', () => {
      service.vincularPet('1', '999').subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores/1/pets/999`);
      req.flush('Pet not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle already linked pet', () => {
      service.vincularPet('1', '1').subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(409);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores/1/pets/1`);
      req.flush('Pet already linked', { status: 409, statusText: 'Conflict' });
    });

    it('should log error and rethrow on failure', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      service.vincularPet('1', '1').subscribe({
        error: (error) => {
          expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao vincular pet:', error);
          consoleErrorSpy.mockRestore();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores/1/pets/1`);
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('desvincularPet', () => {
    it('should unlink a pet from a tutor', () => {
      const tutorId = '1';
      const petId = '5';

      service.desvincularPet(tutorId, petId).subscribe({
        next: (response) => {
          expect(response).toBeNull();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores/${tutorId}/pets/${petId}`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('Authorization')).toBe('Bearer fake-jwt-token');

      req.flush(null);
    });

    it('should handle 404 when tutor not found', () => {
      service.desvincularPet('999', '1').subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores/999/pets/1`);
      req.flush('Tutor not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle pet not linked to tutor', () => {
      service.desvincularPet('1', '999').subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores/1/pets/999`);
      req.flush('Pet not linked to this tutor', { status: 404, statusText: 'Not Found' });
    });

    it('should log error and rethrow on failure', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      service.desvincularPet('1', '1').subscribe({
        error: (error) => {
          expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao desvincular pet:', error);
          consoleErrorSpy.mockRestore();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/tutores/1/pets/1`);
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('Authorization Headers', () => {
    it('should include authorization token in all requests', () => {
      service.listarTutores().subscribe();
      service.obterTutorPorId('1').subscribe();
      service.criarTutor({ nome: 'Test', telefone: '', endereco: '' }).subscribe();
      service.atualizarTutor(1, { nome: 'Test', telefone: '', endereco: '' }).subscribe();
      service.deletarTutor('1').subscribe();
      service.vincularPet('1', '1').subscribe();
      service.desvincularPet('1', '1').subscribe();

      const requests = httpMock.match(req => req.headers.has('Authorization'));
      expect(requests.length).toBe(7);

      requests.forEach(req => {
        expect(req.request.headers.get('Authorization')).toBe('Bearer fake-jwt-token');
        req.flush({});
      });
    });
  });
});