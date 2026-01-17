import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TutorService } from '../../../services/tutor.service';

@Component({
  selector: 'app-tutor-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tutor-detail.html',
  styleUrls: ['./tutor-detail.scss']
})
export class TutorDetailComponent implements OnInit {
  tutor: any = null;
  loading: boolean = false;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tutorService: TutorService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadTutor(+id);
    }
  }

  loadTutor(id: number): void {
    this.loading = true;
    this.tutorService.getTutorById(id).subscribe({
      next: (data) => {
        this.tutor = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar tutor';
        this.loading = false;
        console.error(err);
      }
    });
  }

  editTutor(): void {
    this.router.navigate(['/tutores/editar', this.tutor.id]);
  }

  deleteTutor(): void {
    if (confirm('Deseja realmente excluir este tutor?')) {
      this.tutorService.deleteTutor(this.tutor.id).subscribe({
        next: () => {
          this.router.navigate(['/tutores']);
        },
        error: (err) => {
          this.error = 'Erro ao excluir tutor';
          console.error(err);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/tutores']);
  }
}