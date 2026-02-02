import '../../../../test-setup';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TutorListComponent } from './tutor-list';
import { TutorService, Tutor } from '../../../services/tutor.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { vi } from 'vitest';
import { ChangeDetectorRef } from '@angular/core';

describe('TutorListComponent', () => {
  let component: TutorListComponent;
  let fixture: ComponentFixture<TutorListComponent>;
  let tutorService: any;
  let authService: any;
  let router: any;
  let cdr: any;

  const mockTutores: Tutor[] = [
    {
      id: 1,
      nome: 'João Silva',
      telefone: '11999999999',
      endereco: 'Rua das Flores, 123',
      cpf: '12345678901',
      email: 'joao@email.com',
      foto: {
        id: 1,
        nome: 'joao-foto.jpg',
        url: 'https://example.com/joao-foto.jpg',
        contentType: 'image/jpeg'
      },
      pets: []
    },
    {
      id: 2,
      nome: 'Maria Santos',
      telefone: '11988888888',
      endereco: 'Av.cpf: 98765432100',
      email: 'maria@email.com',
      foto: null,
      pets: []
    }
  ];

  beforeEach(async () => {
    tutorService = {
      listarTutores: vi.fn(),
      deletarTutor: vi.fn()
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
      imports: [TutorListComponent],
      providers: [
        { provide: TutorService, useValue: tutorService },
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        { provide: ChangeDetectorRef, useValue: cdr }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TutorListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loading behavior', () => {
    it('should set loading to true when starting to load tutores', () => {
      tutorService.listarTutores.mockReturnValue(of(mockTutores));
      
      component.loading = false;
      component.carregarTutores();
      
      expect(component.loading).toBe(true);
    });

    it('should set loading to false after successfully loading tutores', async () => {
      tutorService.listarTutores.mockReturnValue(of(mockTutores));
      
      component.carregarTutores();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(component.loading).toBe(false);
      expect(component.tutores.length).toBe(2);
      expect(component.tutoresFiltrados.length).toBe(2);
    });

    it('should set loading to false after error loading tutores', async () => {
      const errorResponse = new HttpErrorResponse({
        error: 'Error loading tutores',
        status: 500,
        statusText: 'Internal Server Error'
      });
      
      tutorService.listarTutores.mockReturnValue(throwError(() => errorResponse));
      
      component.carregarTutores();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(component.loading).toBe(false);
      expect(component.tutores.length).toBe(0);
      expect(component.tutoresFiltrados.length).toBe(0);
    });

    it('should clear tutores and tutoresFiltrados when starting to load', () => {
      tutorService.listarTutores.mockReturnValue(of(mockTutores));
      
      component.tutores = [mockTutores[0]];
      component.tutoresFiltrados = [mockTutores[0]];
      
      component.carregarTutores();
      
      expect(component.tutores).toEqual([]);
      expect(component.tutoresFiltrados).toEqual([]);
    });

    it('should call detectChanges after loading tutores', async () => {
      tutorService.listarTutores.mockReturnValue(of(mockTutores));
      
      component.carregarTutores();
      
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
      
      tutorService.listarTutores.mockReturnValue(throwError(() => error404));
      
      component.carregarTutores();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(component.loading).toBe(false);
      expect(component.tutores).toEqual([]);
      expect(component.errorMessage).toBe('Endpoint não encontrado. Verifique a URL da API.');
    });

    it('should handle 500 internal server error', async () => {
      const error500 = new HttpErrorResponse({
        error: 'Internal Server Error',
        status: 500,
        statusText: 'Internal Server Error'
      });
      
      tutorService.listarTutores.mockReturnValue(throwError(() => error500));
      
      component.carregarTutores();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(component.loading).toBe(false);
      expect(component.tutores).toEqual([]);
      expect(component.errorMessage).toBe('Erro ao carregar tutores');
    });

    it('should handle 401 unauthorized error and logout', async () => {
      vi.useFakeTimers();
      
      const error401 = new HttpErrorResponse({
        error: 'Unauthorized',
        status: 401,
        statusText: 'Unauthorized'
      });
      
      tutorService.listarTutores.mockReturnValue(throwError(() => error401));
      
      component.carregarTutores();
      
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
      
      tutorService.listarTutores.mockReturnValue(throwError(() => networkError));
      
      component.carregarTutores();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(component.loading).toBe(false);
      expect(component.tutores).toEqual([]);
      expect(component.errorMessage).toBe('Erro de conexão. Verifique sua internet ou se a API está disponível.');
    });

    it('should handle empty response from API', async () => {
      tutorService.listarTutores.mockReturnValue(of([]));
      
      component.carregarTutores();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(component.loading).toBe(false);
      expect(component.tutores).toEqual([]);
      expect(component.tutoresFiltrados).toEqual([]);
      expect(component.errorMessage).toBe('');
    });

    it('should handle null response from API', async () => {
      tutorService.listarTutores.mockReturnValue(of(null));
      
      component.carregarTutores();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(component.loading).toBe(false);
      expect(component.tutores).toEqual([]);
      expect(component.tutoresFiltrados).toEqual([]);
    });

    it('should call detectChanges after error', async () => {
      const error = new HttpErrorResponse({
        error: 'Error',
        status: 500,
        statusText: 'Internal Server Error'
      });
      
      tutorService.listarTutores.mockReturnValue(throwError(() => error));
      
      component.carregarTutores();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(cdr.detectChanges).toHaveBeenCalled();
    });
  });

  describe('filtro/busca functionality', () => {
    beforeEach(() => {
      component.tutores = [...mockTutores];
      component.tutoresFiltrados = [...mockTutores];
    });

    it('should filter tutores by name', () => {
      component.termoBusca = 'joão';
      component.aplicarFiltro();
      
      expect(component.tutoresFiltrados.length).toBe(1);
      expect(component.tutoresFiltrados[0].nome).toBe('João Silva');
    });

    it('should filter tutores by phone', () => {
      component.termoBusca = '11999999999';
      component.aplicarFiltro();
      
      expect(component.tutoresFiltrados.length).toBe(1);
      expect(component.tutoresFiltrados[0].telefone).toBe('11999999999');
    });

    it('should filter tutores case-insensitive', () => {
      component.termoBusca = 'JOÃO';
      component.aplicarFiltro();
      
      expect(component.tutoresFiltrados.length).toBe(1);
      expect(component.tutoresFiltrados[0].nome).toBe('João Silva');
    });

    it('should show all tutores when search term is empty', () => {
      component.termoBusca = '';
      component.aplicarFiltro();
      
      expect(component.tutoresFiltrados.length).toBe(2);
    });

    it('should show all tutores when search term is only spaces', () => {
      component.termoBusca = '   ';
      component.aplicarFiltro();
      
      expect(component.tutoresFiltrados.length).toBe(2);
    });

    it('should return empty array when no tutores match search', () => {
      component.termoBusca = 'inexistente';
      component.aplicarFiltro();
      
      expect(component.tutoresFiltrados.length).toBe(0);
    });

    it('should clear search and show all tutores', () => {
      component.termoBusca = 'joão';
      component.aplicarFiltro();
      expect(component.tutoresFiltrados.length).toBe(1);
      
      component.limparBusca();
      
      expect(component.termoBusca).toBe('');
      expect(component.tutoresFiltrados.length).toBe(2);
    });

    it('should filter by partial name match', () => {
      component.termoBusca = 'silva';
      component.aplicarFiltro();
      
      expect(component.tutoresFiltrados.length).toBe(1);
      expect(component.tutoresFiltrados[0].nome).toBe('João Silva');
    });

    it('should filter by partial phone match', () => {
      component.termoBusca = '8888';
      component.aplicarFiltro();
      
      expect(component.tutoresFiltrados.length).toBe(1);
      expect(component.tutoresFiltrados[0].telefone).toBe('11988888888');
    });
  });

  describe('navigation', () => {
    it('should navigate to tutor details', () => {
      component.verDetalhes(1);
      
      expect(router.navigate).toHaveBeenCalledWith(['/tutores', '1']);
    });

    it('should not navigate if id is invalid', () => {
      component.verDetalhes(0);
      
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should navigate to edit tutor', () => {
      component.editarTutor(1);
      
      expect(router.navigate).toHaveBeenCalledWith(['/tutores', 1, 'editar']);
    });

    it('should navigate to new tutor form', () => {
      component.novoTutor();
      
      expect(router.navigate).toHaveBeenCalledWith(['/tutores/novo']);
    });

    it('should navigate to pets page', () => {
      component.voltarParaPets();
      
      expect(router.navigate).toHaveBeenCalledWith(['/pets']);
    });
  });

  describe('delete functionality', () => {
    it('should delete tutor after confirmation', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      tutorService.deletarTutor.mockReturnValue(of(null));
      tutorService.listarTutores.mockReturnValue(of(mockTutores));
      
      component.deletarTutor(1);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(tutorService.deletarTutor).toHaveBeenCalledWith('1');
      expect(tutorService.listarTutores).toHaveBeenCalled();
    });

    it('should not delete tutor if user cancels', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      
      component.deletarTutor(1);
      
      expect(tutorService.deletarTutor).not.toHaveBeenCalled();
    });

    it('should show alert on delete error', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      const error = new HttpErrorResponse({
        error: 'Error deleting tutor',
        status: 500,
        statusText: 'Internal Server Error'
      });
      
      tutorService.deletarTutor.mockReturnValue(throwError(() => error));
      
      component.deletarTutor(1);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(window.alert).toHaveBeenCalledWith('Erro ao deletar tutor');
    });
  });

  describe('logout', () => {
    it('should call authService logout', () => {
      component.logout();
      
      expect(authService.logout).toHaveBeenCalled();
    });
  });

  describe('ngOnInit', () => {
    it('should load tutores on init', () => {
      tutorService.listarTutores.mockReturnValue(of(mockTutores));
      
      component.ngOnInit();
      
      expect(tutorService.listarTutores).toHaveBeenCalled();
    });
  });
});