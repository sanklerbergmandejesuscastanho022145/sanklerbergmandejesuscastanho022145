import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TutorService } from '../../../services/tutor.service';

@Component({
  selector: 'app-tutores-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tutor-list.html',
  styleUrls: ['./tutor-list.scss']
})
export class TutorListComponent implements OnInit {
  tutores: any[] = [];
  loading: boolean = false;
  error: string = '';

  constructor(
    private tutorService: TutorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTutores();
  }

  loadTutores(): void {
    this.loading = true;
    this.tutorService.getAllTutores().subscribe({
      next: (data) => {
        this.tutores = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar tutores';
        this.loading = false;
        console.error(err);
      }
    });
  }

  viewDetails(id: number): void {
    this.router.navigate(['/tutores', id]);
  }

  editTutor(id: number): void {
    this.router.navigate(['/tutores/editar', id]);
  }

  deleteTutor(id: number): void {
    if (confirm('Deseja realmente excluir este tutor?')) {
      this.tutorService.deleteTutor(id).subscribe({
        next: () => {
          this.loadTutores();
        },
        error: (err) => {
          this.error = 'Erro ao excluir tutor';
          console.error(err);
        }
      });
    }
  }

  goToNewTutor(): void {
    this.router.navigate(['/tutores/novo']);
  }
}