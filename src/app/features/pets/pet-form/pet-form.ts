import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PetsService } from '../../../services/pets.service';
import { HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-pet-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pet-form.html',
  styleUrl: './pet-form.scss'
})
export class PetFormComponent implements OnInit {
  petForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  selectedFile: File | null = null;
  fotoPreview: string | null = null;
  uploadProgress = 0;

  constructor(
    private fb: FormBuilder,
    private petsService: PetsService,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.petForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      especie: ['', Validators.required],
      raca: [''],
      idade: [null, [Validators.required, Validators.min(0), Validators.max(50)]],
      tutorId: ['', Validators.required]
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'A foto deve ter no máximo 5MB';
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Por favor, selecione uma imagem válida';
        return;
      }
      
      this.selectedFile = file;
      this.errorMessage = '';
      
      
      this.ngZone.run(() => {
        this.uploadProgress = 0;
        this.fotoPreview = null;
        this.cdr.detectChanges();
      });
      
      const reader = new FileReader();
      
      reader.onprogress = (e: ProgressEvent<FileReader>) => {
        if (e.lengthComputable) {
          
          
          this.ngZone.run(() => {
            this.uploadProgress = Math.round((e.loaded / e.total) * 100);
            this.cdr.detectChanges();
          });
        }
      };
      
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target && e.target.result) {
          
          
          this.ngZone.run(() => {
            this.fotoPreview = e.target?.result as string;
            this.uploadProgress = 100;
            this.cdr.detectChanges();
            
            // atualiza barra após 5segs
            setTimeout(() => {
              this.uploadProgress = 0;
              this.cdr.detectChanges();
            }, 500);
          });
        }
      };
      
      reader.onerror = () => {
        this.ngZone.run(() => {
          this.errorMessage = 'Erro ao carregar preview da imagem';
          this.uploadProgress = 0;
          this.selectedFile = null;
          this.cdr.detectChanges();
        });
      };
      
      reader.readAsDataURL(file);
    }
  }

  removePhoto(): void {
    this.selectedFile = null;
    this.fotoPreview = null;
    this.uploadProgress = 0;
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    if (this.petForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.petsService.criarPet(this.petForm.value).subscribe({
        next: (petCriado: any) => {
          
          if (this.selectedFile && petCriado.id) {
            this.uploadProgress = 0;
            
            this.petsService.uploadFotoPet(petCriado.id, this.selectedFile).subscribe({
              next: (event: any) => {
                if (event.type === HttpEventType.UploadProgress) {
                  if (event.total) {
                    this.uploadProgress = Math.round((100 * event.loaded) / event.total);
                  }
                } else if (event.type === HttpEventType.Response) {
                  this.uploadProgress = 100;
                  setTimeout(() => {
                    this.router.navigate(['/pets']);
                  }, 500);
                }
              },
              error: (error: any) => {
                this.isLoading = false;
                this.uploadProgress = 0;
                this.errorMessage = 'Pet cadastrado, mas erro ao enviar foto. Tente novamente mais tarde.';
                console.error('Erro no upload da foto:', error);
                setTimeout(() => this.router.navigate(['/pets']), 2000);
              }
            });
          } else {
            this.router.navigate(['/pets']);
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          this.uploadProgress = 0;
          this.errorMessage = 'Erro ao cadastrar pet. Tente novamente.';
          console.error('Erro:', error);
        }
      });
    } else {
      this.petForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/pets']);
  }
}