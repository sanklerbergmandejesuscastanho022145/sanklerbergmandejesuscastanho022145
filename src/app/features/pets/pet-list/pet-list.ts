import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PetsService, Pet } from '../../../services/pets.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-pets-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pet-list.html',
  styleUrls: ['./pet-list.scss']
})
export class PetsListComponent implements OnInit {
  pets: Pet[] = [];
  loading = true;
  errorMessage = '';

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
    // console.log('carregarPets() iniciado');
    // console.log('Token atual:', localStorage.getItem('token'));
    
    
    this.loading = true;
    this.errorMessage = '';
    this.pets = [];
    
    this.petsService.listarPets().subscribe({
      next: (data) => {
        
        
        this.pets = data || [];
        this.loading = false;
        this.errorMessage = '';
        // console.log('✅ Estado atualizado:');
        // console.log('   - this.loading:', this.loading);
        // console.log('   - this.errorMessage:', this.errorMessage);
        // console.log('   - this.pets.length:', this.pets.length);
        
        // Força a detecção de mudanças
        this.cdr.detectChanges();
        
        // console.log('✅ detectChanges() executado');
      },
      error: (error) => {
        console.error('Erro completo:', error);
        
        this.pets = [];
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
          // console.log('✅ Pet deletado com sucesso');
          this.carregarPets();
        },
        error: (error) => {
          console.error('❌ Erro ao deletar:', error);
          alert('Erro ao deletar pet');
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }
}