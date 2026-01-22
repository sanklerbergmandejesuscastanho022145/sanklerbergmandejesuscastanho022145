import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TutorService } from '../../../services/tutor.service';
import { PetsService } from '../../../services/pets.service';
import { Tutor } from '../../../services/tutor.service';
import { Pet } from '../../../services/pets.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tutor-detail',
  standalone: true,
  templateUrl: './tutor-detail.html',
  styleUrls: ['./tutor-detail.scss'],
  imports: [CommonModule, FormsModule]
})
export class TutorDetailComponent implements OnInit {
  tutorId: string | null = null;
  tutor: Tutor | null = null;
  petsDisponiveis: Pet[] = [];
  isloading = false;
  loadingVincul = false;
  errorMessage = '';
  successMessage = '';
  showVincularModal = false;
  petSelecionado = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tutorService: TutorService,
    private petService: PetsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.tutorId = this.route.snapshot.paramMap.get('id');
    if (this.tutorId) {
      this.carregarTutor();
    }
  }

  carregarTutor(): void {
  if (!this.tutorId) return;

  console.log('🔵 Iniciando carregamento do tutor:', this.tutorId);
  this.isloading = true;
  this.errorMessage = '';
  this.cdr.detectChanges();

  this.tutorService.obterTutorPorId(this.tutorId).subscribe({
    next: (tutor) => {
      console.log('✅ Tutor carregado com sucesso:', tutor);
      this.tutor = tutor;
      this.isloading = false;
      console.log('🔵 isloading agora é:', this.isloading);
      this.cdr.detectChanges();
    },
    error: (error) => {
      console.error('❌ Erro ao carregar tutor:', error);
      this.errorMessage = 'Erro ao carregar dados do tutor. Tente novamente.';
      this.isloading = false;
      console.log('🔵 isloading agora é:', this.isloading);
      this.cdr.detectChanges();
    }
  });
}

  voltar(): void {
    this.router.navigate(['/tutores']);
  }

  editarTutor(): void {
    if (this.tutorId) {
      this.router.navigate(['/tutores/editar', this.tutorId]);
    }
  }

  deletarTutor(): void {
    if (!this.tutorId) return;

    if (this.tutor?.pets && this.tutor.pets.length > 0) {
      this.errorMessage = 'Não é possível excluir um tutor com pets vinculados. Desvincule os pets primeiro.';
      return;
    }

    if (confirm('Tem certeza que deseja excluir este tutor?')) {
      this.tutorService.deletarTutor(this.tutorId).subscribe({
        next: () => {
          this.successMessage = 'Tutor excluído com sucesso!';
          setTimeout(() => this.router.navigate(['/tutores']), 1500);
        },
        error: (error) => {
          console.error('Erro ao excluir tutor:', error);
          this.errorMessage = 'Erro ao excluir tutor. Tente novamente.';
        }
      });
    }
  }

  abrirModalVincular(): void {
    this.showVincularModal = true;
    this.carregarPetsDisponiveis();
  }

  fecharModalVincular(): void {
    this.showVincularModal = false;
    this.petSelecionado = '';
  }

  carregarPetsDisponiveis(): void {
  this.petService.listarPets().subscribe({
    next: (data) => {
      const pets = data || [];
      // Filtra pets que NÃO têm tutores vinculados (array vazio ou undefined)
      this.petsDisponiveis = pets.filter((pet: Pet) => !pet.tutores || pet.tutores.length === 0);
    },
    error: (error) => {
      console.error('Erro ao carregar pets:', error);
      this.petsDisponiveis = [];
      this.errorMessage = 'Erro ao carregar pets disponíveis.';
    }
      });
    }

  vincularPet(): void {
    if (!this.tutorId || !this.petSelecionado) {
      return;
    }

    this.loadingVincul = true;

    this.tutorService.vincularPet(this.tutorId, this.petSelecionado).subscribe({
      next: () => {
        this.successMessage = 'Pet vinculado com sucesso!';
        this.loadingVincul = false;
        this.fecharModalVincular();
        this.carregarTutor();
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Erro ao vincular pet:', error);
        this.errorMessage = 'Erro ao vincular pet. Tente novamente.';
        this.loadingVincul = false;
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }

  desvincularPet(petId: string): void {
    if (!this.tutorId || !confirm('Tem certeza que deseja desvincular este pet?')) {
      return;
    }

    this.loadingVincul = true;

    this.tutorService.desvincularPet(this.tutorId, petId).subscribe({
      next: () => {
        this.successMessage = 'Pet desvinculado com sucesso!';
        this.loadingVincul = false;
        this.carregarTutor();
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Erro ao desvincular pet:', error);
        this.errorMessage = 'Erro ao desvincular pet. Tente novamente.';
        this.loadingVincul = false;
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }

  verPet(petId: string): void {
    this.router.navigate(['/pets', petId]);
  }
}