import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpEventType } from '@angular/common/http';
import { TutorService, Tutor } from '../../../services/tutor.service';

@Component({
  selector: 'app-tutor-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tutor-form.html',
  styleUrls: ['./tutor-form.scss']
})
export class TutorFormComponent implements OnInit {
  tutor: Tutor = {
    nome: '',
    telefone: '',
    endereco: '',
    email: '',
    cpf: ''
  };
  
  tutorId: string | null = null;
  isEditMode = false;
  loading = false;
  errorMessage = '';
  successMessage = '';
  
  fotoSelecionada: File | null = null;
  fotoPreview: string | null = null;
  uploadProgress = 0;
  isUploading = false;

  constructor(
    private tutorService: TutorService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.tutorId = this.route.snapshot.paramMap.get('id');
    
    if (this.tutorId && this.tutorId !== 'novo') {
      this.isEditMode = true;
      this.carregarTutor();
    }
  }

  carregarTutor(): void {
    if (!this.tutorId) return;
    
    this.loading = true;
    this.errorMessage = '';
    
    this.tutorService.obterTutorPorId(this.tutorId).subscribe({
      next: (data) => {
        this.tutor = data;
        if (this.tutor.foto?.url) {
          this.fotoPreview = this.tutor.foto.url;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar tutor:', error);
        this.errorMessage = 'Erro ao carregar dados do tutor';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        this.errorMessage = 'Formato de arquivo não suportado. Use JPG, PNG ou GIF.';
        return;
      }
      
      // Validar tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Arquivo muito grande. Tamanho máximo: 5MB.';
        return;
      }
      
      this.fotoSelecionada = file;
      this.errorMessage = '';
      
      // Preview da imagem
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.fotoPreview = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  removerFoto(): void {
    this.fotoSelecionada = null;
    this.fotoPreview = this.tutor.foto?.url || null;
    const fileInput = document.getElementById('fotoInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  salvar(): void {
    this.errorMessage = '';
    this.successMessage = '';
    
    // Validações
    if (!this.tutor.nome.trim()) {
      this.errorMessage = 'Nome é obrigatório';
      return;
    }
    
    if (!this.tutor.telefone.trim()) {
      this.errorMessage = 'Telefone é obrigatório';
      return;
    }
    
    if (!this.tutor.endereco.trim()) {
      this.errorMessage = 'Endereço é obrigatório';
      return;
    }
    
    this.loading = true;
    
    const operacao = this.isEditMode && this.tutor.id
      ? this.tutorService.atualizarTutor(this.tutor.id, this.tutor)
      : this.tutorService.criarTutor(this.tutor);
    
    operacao.subscribe({
      next: (tutorSalvo) => {
        console.log('✅ Tutor salvo:', tutorSalvo);
        this.successMessage = this.isEditMode 
          ? 'Tutor atualizado com sucesso!' 
          : 'Tutor criado com sucesso!';
        
        // Se há foto selecionada, fazer upload
        if (this.fotoSelecionada && tutorSalvo.id) {
          this.uploadFoto(tutorSalvo.id.toString());
        } else {
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['/tutores', tutorSalvo.id]);
          }, 1500);
        }
        
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Erro ao salvar:', error);
        this.errorMessage = 'Erro ao salvar tutor';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  uploadFoto(tutorId: string): void {
    if (!this.fotoSelecionada) return;
    
    this.isUploading = true;
    this.uploadProgress = 0;
    
    this.tutorService.uploadFotoTutor(tutorId, this.fotoSelecionada).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          if (event.total) {
            this.uploadProgress = Math.round((100 * event.loaded) / event.total);
            this.cdr.detectChanges();
          }
        } else if (event.type === HttpEventType.Response) {
          console.log('✅ Upload concluído:', event.body);
          this.isUploading = false;
          this.loading = false;
          this.successMessage = 'Tutor e foto salvos com sucesso!';
          
          setTimeout(() => {
            this.router.navigate(['/tutores', tutorId]);
          }, 1500);
          
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('❌ Erro no upload:', error);
        this.errorMessage = 'Erro ao fazer upload da foto';
        this.isUploading = false;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancelar(): void {
    if (this.isEditMode && this.tutorId) {
      this.router.navigate(['/tutores', this.tutorId]);
    } else {
      this.router.navigate(['/tutores']);
    }
  }

  formatarTelefone(): void {
    let telefone = this.tutor.telefone.replace(/\D/g, '');
    
    if (telefone.length <= 10) {
      telefone = telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      telefone = telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    this.tutor.telefone = telefone;
  }

  formatarCPF(): void {
    if (!this.tutor.cpf) return;
    
    let cpf = this.tutor.cpf.replace(/\D/g, '');
    cpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    this.tutor.cpf = cpf;
  }
}