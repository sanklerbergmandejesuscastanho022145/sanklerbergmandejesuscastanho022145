import '../../test-setup';

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PetsService, Pet, PaginatedResponse, Foto, Tutor } from './pets.service';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('PetsService', () => {
  let service: PetsService;
  let httpMock: HttpTestingController;
  const API_URL = 'https://pet-manager-api.geia.vip';

  const mockFoto: Foto = {
    id: 1,
    nome: 'foto-pet.jpg',
    contentType: 'image/jpeg',
    url: 'https://example.com/foto-pet.jpg'
  };

  const mockTutor: Tutor = {
    id: 1,
    nome: 'João Silva',
    email: 'joao@email.com',
    telefone: '11999999999',
    endereco: 'Rua das Flores, 123',
    cpf: 345678901,
    foto: null
  };

  const mockPet: Pet = {
    id: 1,
    nome: 'Rex',
    raca: 'Labrador',
    idade: 3,
    foto: mockFoto,
    tutores: [mockTutor]
  };

  const mockPets: Pet[] = [
    mockPet,
    {
      id: 2,
      nome: 'Luna',
      raca: 'Poodle',
      idade: 2,
      foto: null,
      tutores: []
    }
  ];

  const mockPaginatedResponse: PaginatedResponse<Pet> = {
    page: 0,
    size: 10,
    total: 2,
    pageCount: 1,
    content: mockPets
  };

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'fake-jwt-token');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PetsService]
    });

    service = TestBed.inject(PetsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('listarPets', () => {
    it('should return an array of pets from paginated response', () => {
      service.listarPets().subscribe({
        next: (pets) => {
          expect(pets).toEqual(mockPets);
          expect(pets.length).toBe(2);
          expect(pets[0].nome).toBe('Rex');
          expect(pets[1].nome).toBe('Luna');
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/pets`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer fake-jwt-token');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      
      req.flush(mockPaginatedResponse);
    });

    it('should extract content from paginated response correctly', () => {
      service.listarPets().subscribe({
        next: (pets) => {
          expect(Array.isArray(pets)).toBe(true);
          expect(pets).toEqual(mockPaginatedResponse.content);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/pets`);
      req.flush(mockPaginatedResponse);
    });

    it('should handle empty content array', () => {
      const emptyResponse: PaginatedResponse<Pet> = {
        page: 0,
        size: 10,
        total: 0,
        pageCount: 0,
        content: []
      };

      service.listarPets().subscribe({
        next: (pets) => {
          expect(pets).toEqual([]);
          expect(pets.length).toBe(0);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/pets`);
      req.flush(emptyResponse);
    });

    it('should handle 404 error', () => {
      service.listarPets().subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/pets`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle 500 error', () => {
      service.listarPets().subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/pets`);
      req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle 401 unauthorized error', () => {
      service.listarPets().subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(401);
          expect(error.statusText).toBe('Unauthorized');
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/pets`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should include authorization token in headers', () => {
      service.listarPets().subscribe();

      const req = httpMock.expectOne(`${API_URL}/v1/pets`);
      expect(req.request.headers.has('Authorization')).toBe(true);
      expect(req.request.headers.get('Authorization')).toBe('Bearer fake-jwt-token');
      
      req.flush(mockPaginatedResponse);
    });

    it('should handle network error', () => {
      service.listarPets().subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error) => {
          expect(error.error).toBeTruthy();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/pets`);
      req.error(new ProgressEvent('Network error'));
    });
  });

  describe('obterPetPorId', () => {
    it('should return a single pet by id', () => {
      service.obterPetPorId(1).subscribe({
        next: (pet) => {
          expect(pet).toEqual(mockPet);
          expect(pet.id).toBe(1);
          expect(pet.nome).toBe('Rex');
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/pets/1`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer fake-jwt-token');
      
      req.flush(mockPet);
    });

    it('should handle 404 when pet not found', () => {
      service.obterPetPorId(999).subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/pets/999`);
      req.flush('Pet not found', { status: 404, statusText: 'Not Found' });
    });

    it('should return pet without foto', () => {
      const petSemFoto: Pet = { ...mockPet, foto: null };

      service.obterPetPorId(1).subscribe({
        next: (pet) => {
          expect(pet.foto).toBeNull();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/pets/1`);
      req.flush(petSemFoto);
    });

    it('should return pet without tutores', () => {
      const petSemTutores: Pet = { ...mockPet, tutores: [] };

      service.obterPetPorId(1).subscribe({
        next: (pet) => {
          expect(pet.tutores).toEqual([]);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/pets/1`);
      req.flush(petSemTutores);
    });
  });

  describe('criarPet', () => {
    it('should create a new pet', () => {
      const novoPet: Pet = {
        nome: 'Buddy',
        raca: 'Golden Retriever',
        idade: 1
      };

      const petCriado: Pet = { ...novoPet, id: 3 };

      service.criarPet(novoPet).subscribe({
        next: (pet) => {
          expect(pet).toEqual(petCriado);
          expect(pet.id).toBe(3);
          expect(pet.nome).toBe('Buddy');
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/pets`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(novoPet);
      expect(req.request.headers.get('Authorization')).toBe('Bearer fake-jwt-token');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      
      req.flush(petCriado);
    });

    it('should handle validation error when creating pet', () => {
      const petInvalido: Pet = { nome: '' };

      service.criarPet(petInvalido).subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/pets`);
      req.flush('Validation error', { status: 400, statusText: 'Bad Request' });
    });

    it('should create pet with optional fields', () => {
      const novoPet: Pet = {
        nome: 'Max',
        raca: 'Beagle',
        idade: 2,
        foto: mockFoto,
        tutores: [mockTutor]
      };

      service.criarPet(novoPet).subscribe({
        next: (pet) => {
          expect(pet.foto).toEqual(mockFoto);
          expect(pet.tutores).toEqual([mockTutor]);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/pets`);
      req.flush({ ...novoPet, id: 4 });
    });
  });

  describe('atualizarPet', () => {
    it('should update an existing pet', () => {
      const petAtualizado: Pet = {
        id: 1,
        nome: 'Rex Updated',
        raca: 'Labrador Retriever',
        idade: 4
      };

      service.atualizarPet(1, petAtualizado).subscribe({
        next: (pet) => {
          expect(pet).toEqual(petAtualizado);
          expect(pet.nome).toBe('Rex Updated');
          expect(pet.idade).toBe(4);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/pets/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(petAtualizado);
      expect(req.request.headers.get('Authorization')).toBe('Bearer fake-jwt-token');
      
      req.flush(petAtualizado);
    });

    it('should handle 404 when updating non-existent pet', () => {
      const petAtualizado: Pet = { nome: 'Inexistente' };

      service.atualizarPet(999, petAtualizado).subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/pets/999`);
      req.flush('Pet not found', { status: 404, statusText: 'Not Found' });
    });

    it('should update pet with partial data', () => {
      const petParcial: Pet = { nome: 'Rex Modified' };

      service.atualizarPet(1, petParcial).subscribe({
        next: (pet) => {
          expect(pet.nome).toBe('Rex Modified');
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/pets/1`);
      req.flush({ ...mockPet, nome: 'Rex Modified' });
    });
  });

  describe('uploadFotoPet', () => {
    it('should upload pet photo successfully', () => {
      const file = new File(['fake content'], 'pet-photo.jpg', { type: 'image/jpeg' });
      const petId = '1';

      service.uploadFotoPet(petId, file).subscribe({
        next: (event) => {
          if (event.type === HttpEventType.Response) {
            expect(event.body).toBeTruthy();
          }
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/pets/${petId}/fotos`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe('Bearer fake-jwt-token');
      expect(req.request.headers.has('Content-Type')).toBe(false);
      expect(req.request.body instanceof FormData).toBe(true);
      expect(req.request.reportProgress).toBe(true);
      
      req.flush({ success: true, foto: mockFoto });
    });

    it('should handle upload error', () => {
      const file = new File(['fake content'], 'pet-photo.jpg', { type: 'image/jpeg' });

      service.uploadFotoPet('1', file).subscribe({
        next: () => {
          expect.fail('should have failed');
        },
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/pets/1/fotos`);
      req.flush({ error: 'Upload failed' }, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle file size limit error', () => {
      const file = new File(['fake content'], 'large-photo.jpg', { type: 'image/jpeg' });

      service.uploadFotoPet('1', file).subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(413);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/pets/1/fotos`);
      req.flush('File too large', { status: 413, statusText: 'Payload Too Large' });
    });

    it('should include FormData with foto field', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      service.uploadFotoPet('1', file).subscribe();

      const req = httpMock.expectOne(`${API_URL}/v1/pets/1/fotos`);
      const formData = req.request.body as FormData;
      
      expect(formData.get('foto')).toBeTruthy();
      expect((formData.get('foto') as File).name).toBe('test.jpg');
      
      req.flush({ success: true });
    });
  });

  describe('deletarPet', () => {
    it('should delete a pet by id', () => {
      service.deletarPet(1).subscribe({
        next: (response) => {
          expect(response).toBeNull();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/pets/1`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('Authorization')).toBe('Bearer fake-jwt-token');
      
      req.flush(null);
    });

    it('should handle 404 when deleting non-existent pet', () => {
      service.deletarPet(999).subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/pets/999`);
      req.flush('Pet not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle 403 when user lacks permission', () => {
      service.deletarPet(1).subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(403);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/pets/1`);
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });

    it('should handle server error on delete', () => {
      service.deletarPet(1).subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/v1/pets/1`);
      req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('Authorization Headers', () => {
    it('should include authorization token in all requests', () => {
      service.listarPets().subscribe();
      service.obterPetPorId(1).subscribe();
      service.criarPet({ nome: 'Test' }).subscribe();
      service.atualizarPet(1, { nome: 'Test' }).subscribe();
      service.deletarPet(1).subscribe();

      const requests = httpMock.match(req => req.headers.has('Authorization'));
      expect(requests.length).toBe(5);
      
      requests.forEach(req => {
        expect(req.request.headers.get('Authorization')).toBe('Bearer fake-jwt-token');
        req.flush({});
      });
    });

    it('should work when token is not present in localStorage', () => {
      localStorage.removeItem('token');

      service.listarPets().subscribe();

      const req = httpMock.expectOne(`${API_URL}/v1/pets`);
      expect(req.request.headers.get('Authorization')).toBe('Bearer null');
      
      req.flush(mockPaginatedResponse);
    });
  });
});