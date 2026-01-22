import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PetsService, Pet } from '../../../services/pets.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-pets-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pet-list.html',
  styleUrls: ['./pet-list.scss']
})
export class PetsListComponent implements OnInit {
  pets: Pet[] = [];
  petsFiltrados: Pet[] = [];
  loading = true;
  errorMessage = '';
  termoBusca = '';

  constructor(
    private petsService: PetsService,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarPets();
  }

  carregarPets(): void {
    this.loading = true;
    this.errorMessage = '';
    this.pets = [];
    this.petsFiltrados = [];
    
    this.petsService.listarPets().subscribe({
      next: (data) => {
        this.pets = data || [];
        this.petsFiltrados = [...this.pets];
        this.loading = false;
        this.errorMessage = '';
        this.aplicarFiltro();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro completo:', error);
        
        this.pets = [];
        this.petsFiltrados = [];
        this.loading = false;
        
        if (error.status === 401) {
          this.errorMessage = 'Sessão expirada. Faça login novamente.';
          setTimeout(() => this.authService.logout(), 2000);
        } else if (error.status === 404) {
          this.errorMessage = 'Endpoint não encontrado. Verifique a URL da API.';
        } else if (error.status === 0) {
          this.errorMessage = 'Erro de conexão. Verifique sua internet ou se a API está disponível.';
        } else {
          this.errorMessage = 'Erro ao carregar pets';
        }
        
        this.cdr.detectChanges();
      }
    });
  }

  aplicarFiltro(): void {
    if (!this.termoBusca.trim()) {
      this.petsFiltrados = [...this.pets];
    } else {
      const termo = this.termoBusca.toLowerCase().trim();
      this.petsFiltrados = this.pets.filter(pet =>
        pet.nome.toLowerCase().includes(termo)
      );
    }
  }

  limparBusca(): void {
    this.termoBusca = '';
    this.aplicarFiltro();
  }

  verDetalhes(id: number): void {
    if (id) {
      this.router.navigate(['/pets', id.toString()]);
    }
  }

  editarPet(id: number): void {
    this.router.navigate(['/pets', id, 'editar']);
  }

  novoPet(): void {
    this.router.navigate(['/pets/novo']);
  }

  deletarPet(id: number): void {
    if (confirm('Deseja realmente deletar este pet?')) {
      this.petsService.deletarPet(id.toString()).subscribe({
        next: () => {
          this.carregarPets();
        },
        error: (error) => {
          console.error('❌ Erro ao deletar:', error);
          alert('Erro ao deletar pet');
        }
      });
    }
  }

  irParaTutores(): void {
  this.router.navigate(['/tutores']);
}

  logout(): void {
    this.authService.logout();
  }
}