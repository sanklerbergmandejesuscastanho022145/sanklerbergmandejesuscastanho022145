import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PetsService } from '../../../services/pets.service';
import { Pet } from '../../../services/pets.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pet-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pet-detail.html',
  styleUrl: './pet-detail.scss'
})
export class PetDetailComponent implements OnInit, OnDestroy {
  pet: Pet | null = null;
  isLoading = false;
  errorMessage = '';
  petId!: string;
  imageUrl = '/assets/pet-placeholder.png';
  private routeSub?: Subscription;
  private petSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private petsService: PetsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    
    const id = this.route.snapshot.paramMap.get('id');

    if (id && this.isValidId(id)) {
      this.petId = id;
      this.carregarDetalhesPet();
    } else {
      this.errorMessage = 'ID do pet inválido';
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.petSub?.unsubscribe();
  }

  private isValidId(id: string): boolean {
    const numId = Number(id);
    return !isNaN(numId) && numId > 0 && Number.isInteger(numId);
  }

  carregarDetalhesPet(): void {
    

    // Cancela request anterior se existir
    if (this.petSub) {
      this.petSub.unsubscribe();
    }

    this.isLoading = true;
    this.errorMessage = '';
    

    this.petSub = this.petsService
      .obterPetPorId(this.petId)
      .subscribe({
        next: (data) => {
          
          
          this.pet = data;
          this.imageUrl = data?.foto?.url || '/assets/pet-placeholder.png';
          this.isLoading = false;
          
          
          
          this.cdr.detectChanges();
          
          
        },
        error: (error) => {
          console.error('Falha ao carregar pet:', error);
          
          this.isLoading = false;
          
          if (error.status === 404) {
            this.errorMessage = 'Pet não encontrado';
          } else {
            this.errorMessage = 'Erro ao carregar detalhes do pet';
          }
          
          
          this.cdr.detectChanges();
        }
      });
  }

  voltarParaLista(): void {
    this.router.navigate(['/pets']);
  }

  editarPet(): void {
    if (!this.petId) return;
    this.router.navigate(['/pets', this.petId, 'editar']);
  }

  excluirPet(): void {
    if (!this.pet) return;
    if (confirm(`Tem certeza que deseja excluir ${this.pet.nome}?`)) {
      this.petsService.deletarPet(this.petId).subscribe({
        next: () => {
          this.router.navigate(['/pets']);
        },
        error: (error) => {
          if (error.status === 404) {
            this.errorMessage = 'Pet não encontrado';
          } else if (error.status === 401) {
            this.errorMessage = 'Você não tem permissão para excluir este pet';
          } else {
            this.errorMessage = 'Erro ao excluir pet';
          }
          console.error('Erro:', error);
        }
      });
    }
  }
}