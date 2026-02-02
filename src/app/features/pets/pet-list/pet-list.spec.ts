import '../../../../test-setup';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PetsListComponent } from './pet-list';
import { PetsService } from '../../../services/pets.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { vi } from 'vitest';
import { ChangeDetectorRef } from '@angular/core';

describe('PetListComponent', () => {
  let component: PetsListComponent;
  let fixture: ComponentFixture<PetsListComponent>;
  let petsService: any;
  let authService: any;
  let router: any;
  let cdr: any;

  const mockPets = [
    {
      id: 1,
      nome: 'Rex',
      especie: 'Cachorro',
      raca: 'Labrador',
      idade: 3,
      foto: {
        id: 1,
        nome: 'rex-foto.jpg',
        url: 'https://example.com/rex-foto.jpg',
        contentType: 'image/jpeg'
      }
    },
    {
      id: 2,
      nome: 'Miau',
      especie: 'Gato',
      raca: 'Siamês',
      idade: 2,
      foto: null
    }
  ];

  beforeEach(async () => {
    petsService = {
      listarPets: vi.fn(),
      deletarPet: vi.fn()
    };

    authService = {
      logout: vi.fn()
    };

    router = {
      navigate: vi.fn()
    };

    cdr = {
      detectChanges: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [PetsListComponent],
      providers: [
        { provide: PetsService, useValue: petsService },
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        { provide: ChangeDetectorRef, useValue: cdr }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PetsListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loading behavior', () => {
    it('should set loading to true when starting to load pets', () => {
      petsService.listarPets.mockReturnValue(of(mockPets));
      
      component.loading = false;
      component.carregarPets();
      
      expect(component.loading).toBe(true);
    });

    it('should set loading to false after successfully loading pets', async () => {
      petsService.listarPets.mockReturnValue(of(mockPets));
      
      component.carregarPets();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(component.loading).toBe(false);
      expect(component.pets.length).toBe(2);
      expect(component.petsFiltrados.length).toBe(2);
    });

    it('should set loading to false after error loading pets', async () => {
      const errorResponse = new HttpErrorResponse({
        error: 'Error loading pets',
        status: 500,
        statusText: 'Internal Server Error'
      });
      
      petsService.listarPets.mockReturnValue(throwError(() => errorResponse));
      
      component.carregarPets();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(component.loading).toBe(false);
      expect(component.pets.length).toBe(0);
      expect(component.petsFiltrados.length).toBe(0);
    });

    it('should clear pets and petsFiltrados when starting to load', () => {
      petsService.listarPets.mockReturnValue(of(mockPets));
      
      component.pets = [mockPets[0]];
      component.petsFiltrados = [mockPets[0]];
      
      component.carregarPets();
      
      expect(component.pets).toEqual([]);
      expect(component.petsFiltrados).toEqual([]);
    });

    it('should call detectChanges after loading pets', async () => {
      petsService.listarPets.mockReturnValue(of(mockPets));
      
      component.carregarPets();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(cdr.detectChanges).toHaveBeenCalled();
    });
  });

  describe('API error handling', () => {
    it('should handle 404 error gracefully', async () => {
      const error404 = new HttpErrorResponse({
        error: 'Not Found',
        status: 404,
        statusText: 'Not Found'
      });
      
      petsService.listarPets.mockReturnValue(throwError(() => error404));
      
      component.carregarPets();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(component.loading).toBe(false);
      expect(component.pets).toEqual([]);
      expect(component.errorMessage).toBe('Endpoint não encontrado. Verifique a URL da API.');
    });

    it('should handle 500 internal server error', async () => {
      const error500 = new HttpErrorResponse({
        error: 'Internal Server Error',
        status: 500,
        statusText: 'Internal Server Error'
      });
      
      petsService.listarPets.mockReturnValue(throwError(() => error500));
      
      component.carregarPets();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(component.loading).toBe(false);
      expect(component.pets).toEqual([]);
      expect(component.errorMessage).toBe('Erro ao carregar pets');
    });

    it('should handle 401 unauthorized error and logout', async () => {
      vi.useFakeTimers();
      
      const error401 = new HttpErrorResponse({
        error: 'Unauthorized',
        status: 401,
        statusText: 'Unauthorized'
      });
      
      petsService.listarPets.mockReturnValue(throwError(() => error401));
      
      component.carregarPets();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(component.loading).toBe(false);
      expect(component.errorMessage).toBe('Sessão expirada. Faça login novamente.');
      
      vi.advanceTimersByTime(2000);
      
      expect(authService.logout).toHaveBeenCalled();
      
      vi.useRealTimers();
    });

    it('should handle network error (status 0)', async () => {
      const networkError = new HttpErrorResponse({
        error: new ErrorEvent('Network error', {
          message: 'Network connection failed'
        }),
        status: 0,
        statusText: 'Unknown Error'
      });
      
      petsService.listarPets.mockReturnValue(throwError(() => networkError));
      
      component.carregarPets();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(component.loading).toBe(false);
      expect(component.pets).toEqual([]);
      expect(component.errorMessage).toBe('Erro de conexão. Verifique sua internet ou se a API está disponível.');
    });

    it('should handle empty response from API', async () => {
      petsService.listarPets.mockReturnValue(of([]));
      
      component.carregarPets();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(component.loading).toBe(false);
      expect(component.pets).toEqual([]);
      expect(component.petsFiltrados).toEqual([]);
      expect(component.errorMessage).toBe('');
    });

    it('should call detectChanges after error', async () => {
      const error = new HttpErrorResponse({
        error: 'Error',
        status: 500,
        statusText: 'Internal Server Error'
      });
      
      petsService.listarPets.mockReturnValue(throwError(() => error));
      
      component.carregarPets();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(cdr.detectChanges).toHaveBeenCalled();
    });
  });

  describe('filtro/busca functionality', () => {
    beforeEach(() => {
      component.pets = [...mockPets];
      component.petsFiltrados = [...mockPets];
    });

    it('should filter pets by name', () => {
      component.termoBusca = 'rex';
      component.aplicarFiltro();
      
      expect(component.petsFiltrados.length).toBe(1);
      expect(component.petsFiltrados[0].nome).toBe('Rex');
    });

    it('should filter pets case-insensitive', () => {
      component.termoBusca = 'REX';
      component.aplicarFiltro();
      
      expect(component.petsFiltrados.length).toBe(1);
      expect(component.petsFiltrados[0].nome).toBe('Rex');
    });

    it('should show all pets when search term is empty', () => {
      component.termoBusca = '';
      component.aplicarFiltro();
      
      expect(component.petsFiltrados.length).toBe(2);
    });

    it('should show all pets when search term is only spaces', () => {
      component.termoBusca = '   ';
      component.aplicarFiltro();
      
      expect(component.petsFiltrados.length).toBe(2);
    });

    it('should return empty array when no pets match search', () => {
      component.termoBusca = 'inexistente';
      component.aplicarFiltro();
      
      expect(component.petsFiltrados.length).toBe(0);
    });

    it('should clear search and show all pets', () => {
      component.termoBusca = 'rex';
      component.aplicarFiltro();
      expect(component.petsFiltrados.length).toBe(1);
      
      component.limparBusca();
      
      expect(component.termoBusca).toBe('');
      expect(component.petsFiltrados.length).toBe(2);
    });

    it('should filter by partial name match', () => {
      component.termoBusca = 'ia';
      component.aplicarFiltro();
      
      expect(component.petsFiltrados.length).toBe(1);
      expect(component.petsFiltrados[0].nome).toBe('Miau');
    });
  });

  describe('navigation', () => {
    it('should navigate to pet details', () => {
      component.verDetalhes(1);
      
      expect(router.navigate).toHaveBeenCalledWith(['/pets', '1']);
    });

    it('should not navigate if id is invalid', () => {
      component.verDetalhes(0);
      
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should navigate to edit pet', () => {
      component.editarPet(1);
      
      expect(router.navigate).toHaveBeenCalledWith(['/pets', 1, 'editar']);
    });

    it('should navigate to new pet form', () => {
      component.novoPet();
      
      expect(router.navigate).toHaveBeenCalledWith(['/pets/novo']);
    });

    it('should navigate to tutores page', () => {
      component.irParaTutores();
      
      expect(router.navigate).toHaveBeenCalledWith(['/tutores']);
    });
  });

  describe('delete functionality', () => {
    it('should delete pet after confirmation', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      petsService.deletarPet.mockReturnValue(of(null));
      petsService.listarPets.mockReturnValue(of(mockPets));
      
      component.deletarPet(1);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(petsService.deletarPet).toHaveBeenCalledWith(1);
      expect(petsService.listarPets).toHaveBeenCalled();
    });

    it('should not delete pet if user cancels', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      
      component.deletarPet(1);
      
      expect(petsService.deletarPet).not.toHaveBeenCalled();
    });

    it('should show alert on delete error', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      const error = new HttpErrorResponse({
        error: 'Error deleting pet',
        status: 500,
        statusText: 'Internal Server Error'
      });
      
      petsService.deletarPet.mockReturnValue(throwError(() => error));
      
      component.deletarPet(1);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(window.alert).toHaveBeenCalledWith('Erro ao deletar pet');
    });
  });

  describe('logout', () => {
    it('should call authService logout', () => {
      component.logout();
      
      expect(authService.logout).toHaveBeenCalled();
    });
  });

  describe('ngOnInit', () => {
    it('should load pets on init', () => {
      petsService.listarPets.mockReturnValue(of(mockPets));
      
      component.ngOnInit();
      
      expect(petsService.listarPets).toHaveBeenCalled();
    });
  });
});