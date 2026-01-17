import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Tutor {
  id?: number;
  nome: string;
  cpf: string;
  telefone?: string;
  email?: string;
  endereco?: string;
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
export class TutorService {
  private readonly API_URL = 'https://pet-manager-api.geia.vip';

  constructor(private http: HttpClient) {}

  // Listar todos os tutores
  getAllTutores(): Observable<Tutor[]> {
    return this.http.get<PaginatedResponse<Tutor>>(`${this.API_URL}/v1/tutores`)
      .pipe(
        map(response => response.content)
      );
  }

  // Buscar tutor por ID
  getTutorById(id: number): Observable<Tutor> {
    return this.http.get<Tutor>(`${this.API_URL}/v1/tutores/${id}`);
  }

  // Criar novo tutor
  createTutor(tutor: Tutor): Observable<Tutor> {
    return this.http.post<Tutor>(`${this.API_URL}/v1/tutores`, tutor);
  }

  // Atualizar tutor existente
  updateTutor(id: number, tutor: Tutor): Observable<Tutor> {
    return this.http.put<Tutor>(`${this.API_URL}/v1/tutores/${id}`, tutor);
  }

  // Deletar tutor
  deleteTutor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/v1/tutores/${id}`);
  }

  // Listar pets de um tutor específico
  getPetsByTutorId(tutorId: number): Observable<any[]> {
    return this.http.get<PaginatedResponse<any>>(`${this.API_URL}/v1/tutores/${tutorId}/pets`)
      .pipe(
        map(response => response.content)
      );
  }
}