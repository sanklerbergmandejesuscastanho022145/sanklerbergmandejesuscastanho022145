import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TutorService } from '../../../services/tutor.service';

@Component({
  selector: 'app-tutor-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tutor-form.html',
  styleUrls: ['./tutor-form.scss']
})
export class TutorFormComponent implements OnInit {
  tutorForm: FormGroup;
  isEditMode: boolean = false;
  tutorId: number | null = null;
  error: string = '';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private tutorService: TutorService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.tutorForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/)]],
      endereco: [''],
      cidade: [''],
      estado: [''],
      cep: ['', [Validators.pattern(/^\d{5}-\d{3}$/)]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.tutorId = +params['id'];
        this.loadTutor(this.tutorId);
      }
    });
  }

  loadTutor(id: number): void {
    this.loading = true;
    this.tutorService.getTutorById(id).subscribe({
      next: (tutor) => {
        this.tutorForm.patchValue(tutor);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar tutor';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.tutorForm.valid) {
      this.loading = true;
      const tutorData = this.tutorForm.value;

      const request = this.isEditMode && this.tutorId
        ? this.tutorService.updateTutor(this.tutorId, tutorData)
        : this.tutorService.createTutor(tutorData);

      request.subscribe({
        next: () => {
          this.router.navigate(['/tutores']);
        },
        error: (err) => {
          this.error = 'Erro ao salvar tutor';
          this.loading = false;
          console.error(err);
        }
      });
    } else {
      this.markFormGroupTouched(this.tutorForm);
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  cancel(): void {
    this.router.navigate(['/tutores']);
  }
}