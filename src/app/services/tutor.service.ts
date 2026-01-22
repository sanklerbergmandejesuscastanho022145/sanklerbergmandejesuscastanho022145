import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Foto {
  id: number;
  nome: string;
  contentType: string;
  url: string;
}

export interface Tutor {
  id?: number;
  nome: string;
  telefone: string;
  endereco: string;
  cpf?: string;
  email?: string;
  foto?: Foto | null;
  pets?: any[];
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

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  listarTutores(): Observable<Tutor[]> {
    return this.http.get<PaginatedResponse<Tutor>>(`${this.API_URL}/v1/tutores`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.content),
      catchError(error => {
        console.error('Erro ao buscar tutores:', error);
        return throwError(() => error);
      })
    );
  }

  obterTutorPorId(id: string): Observable<Tutor> {
    return this.http.get<Tutor>(`${this.API_URL}/v1/tutores/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Erro ao buscar tutor:', error);
        return throwError(() => error);
      })
    );
  }

  criarTutor(tutor: Tutor): Observable<Tutor> {
    return this.http.post<Tutor>(`${this.API_URL}/v1/tutores`, tutor, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Erro ao criar tutor:', error);
        return throwError(() => error);
      })
    );
  }

  atualizarTutor(id: number, tutor: Tutor): Observable<Tutor> {
    return this.http.put<Tutor>(`${this.API_URL}/v1/tutores/${id}`, tutor, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Erro ao atualizar tutor:', error);
        return throwError(() => error);
      })
    );
  }

  uploadFotoTutor(tutorId: string, foto: File): Observable<any> {
    const formData = new FormData();
    formData.append('foto', foto);
    
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.post(`${this.API_URL}/v1/tutores/${tutorId}/fotos`, formData, {
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

  deletarTutor(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/v1/tutores/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Erro ao deletar tutor:', error);
        return throwError(() => error);
      })
    );
  }

  vincularPet(tutorId: string, petId: string): Observable<void> {
    return this.http.post<void>(
      `${this.API_URL}/v1/tutores/${tutorId}/pets/${petId}`, 
      {},
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Erro ao vincular pet:', error);
        return throwError(() => error);
      })
    );
  }

  desvincularPet(tutorId: string, petId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/v1/tutores/${tutorId}/pets/${petId}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Erro ao desvincular pet:', error);
        return throwError(() => error);
      })
    );
  }
}