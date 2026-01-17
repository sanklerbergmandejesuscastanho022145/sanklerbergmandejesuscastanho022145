import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface Foto {
  id: number;
  nome: string;
  contentType: string;
  url: string;
}

export interface Tutor {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cpf: number;
  foto?: Foto | null;
}

export interface Pet {
  id?: number;
  nome: string;
  raca?: string;
  idade?: number;
  foto?: Foto | null;
  tutores?: Tutor[];
}

export interface PaginatedResponse<T> {
  page: number;
  size: number;
  total: number;
  pageCount: number;
  content: T[];
}

@Injectable({
  providedIn: 'root'
})
export class PetsService {
  private readonly API_URL = 'https://pet-manager-api.geia.vip';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  listarPets(): Observable<Pet[]> {
    return this.http.get<PaginatedResponse<Pet>>(`${this.API_URL}/v1/pets`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.content),
      catchError(error => {
        console.error('Erro ao buscar pets:', error);
        return throwError(() => error);
      })
    );
  }

  obterPetPorId(id: string): Observable<Pet> {
    return this.http.get<Pet>(`${this.API_URL}/v1/pets/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  

  criarPet(pet: Pet): Observable<Pet> {
    return this.http.post<Pet>(`${this.API_URL}/v1/pets`, pet, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Erro ao criar pet:', error);
        return throwError(() => error);
      })
    );
  }

  atualizarPet(id: number, pet: Pet): Observable<Pet> {
    return this.http.put<Pet>(`${this.API_URL}/v1/pets/${id}`, pet, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Erro ao atualizar pet:', error);
        return throwError(() => error);
      })
    );
  }

  uploadFotoPet(petId: string, foto: File): Observable<any> {
    const formData = new FormData();
    formData.append('foto', foto);
    
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.post(`${this.API_URL}/v1/pets/${petId}/fotos`, formData, {
      headers: headers,
      reportProgress: true,
      observe: 'events'
    }).pipe(
      catchError(error => {
        console.error('Erro ao fazer upload da foto:', error);
        return throwError(() => error);
      })
    );
  }

  deletarPet(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/v1/pets/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Erro ao deletar pet:', error);
        return throwError(() => error);
      })
    );
  }
}