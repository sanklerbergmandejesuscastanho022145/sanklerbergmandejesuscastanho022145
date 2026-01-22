import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TutorService, Tutor } from '../../../services/tutor.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-tutor-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tutor-list.html',
  styleUrls: ['./tutor-list.scss']
})
export class TutorListComponent implements OnInit {
  tutores: Tutor[] = [];
  tutoresFiltrados: Tutor[] = [];
  loading = true;
  errorMessage = '';
  termoBusca = '';

  constructor(
    private tutorService: TutorService,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarTutores();
  }

  carregarTutores(): void {
    this.loading = true;
    this.errorMessage = '';
    this.tutores = [];
    this.tutoresFiltrados = [];
    
    this.tutorService.listarTutores().subscribe({
      next: (data) => {
        this.tutores = data || [];
        this.tutoresFiltrados = [...this.tutores];
        this.loading = false;
        this.errorMessage = '';
        this.aplicarFiltro();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro completo:', error);
        
        this.tutores = [];
        this.tutoresFiltrados = [];
        this.loading = false;
        
        if (error.status === 401) {
          this.errorMessage = 'Sessão expirada. Faça login novamente.';
          setTimeout(() => this.authService.logout(), 2000);
        } else if (error.status === 404) {
          this.errorMessage = 'Endpoint não encontrado. Verifique a URL da API.';
        } else if (error.status === 0) {
          this.errorMessage = 'Erro de conexão. Verifique sua internet ou se a API está disponível.';
        } else {
          this.errorMessage = 'Erro ao carregar tutores';
        }
        
        this.cdr.detectChanges();
      }
    });
  }

  aplicarFiltro(): void {
    if (!this.termoBusca.trim()) {
      this.tutoresFiltrados = [...this.tutores];
    } else {
      const termo = this.termoBusca.toLowerCase().trim();
      this.tutoresFiltrados = this.tutores.filter(tutor =>
        tutor.nome.toLowerCase().includes(termo) ||
        tutor.telefone.toLowerCase().includes(termo)
      );
    }
  }

  limparBusca(): void {
    this.termoBusca = '';
    this.aplicarFiltro();
  }

  verDetalhes(id: number): void {
    if (id) {
      this.router.navigate(['/tutores', id.toString()]);
    }
  }

  editarTutor(id: number): void {
    this.router.navigate(['/tutores', id, 'editar']);
  }

  novoTutor(): void {
    this.router.navigate(['/tutores/novo']);
  }

  deletarTutor(id: number): void {
    if (confirm('Deseja realmente deletar este tutor?')) {
      this.tutorService.deletarTutor(id.toString()).subscribe({
        next: () => {
          this.carregarTutores();
        },
        error: (error) => {
          console.error('❌ Erro ao deletar:', error);
          alert('Erro ao deletar tutor');
        }
      });
    }
  }

  voltarParaPets(): void {
    this.router.navigate(['/pets']);
  }

  logout(): void {
    this.authService.logout();
  }
}