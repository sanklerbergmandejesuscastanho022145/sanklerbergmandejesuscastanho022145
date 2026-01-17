import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
  path: 'auth/login',
  loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterComponent)
  },
  {
    path: 'pets',
    loadComponent: () => import('./features/pets/pet-list/pet-list').then(m => m.PetsListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'pets/novo',
    loadComponent: () => import('./features/pets/pet-form/pet-form').then(m => m.PetFormComponent),
    canActivate: [AuthGuard]
  },
  {
  path: 'pets/:id/editar',
  loadComponent: () => import('./features/pets/pet-form/pet-form').then(m => m.PetFormComponent),
  canActivate: [AuthGuard]
  },
  {
    path: 'pets/:id',
    loadComponent: () => import('./features/pets/pet-detail/pet-detail').then(m => m.PetDetailComponent),
    canActivate: [AuthGuard]
  },

  {
    path: 'tutores',
    loadComponent: () => import('./features/tutores/tutor-list/tutor-list').then(m => m.TutorListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'tutores/novo',
    loadComponent: () => import('./features/tutores/tutor-form/tutor-form').then(m => m.TutorFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'tutores/:id',
    loadComponent: () => import('./features/tutores/tutor-detail/tutor-detail').then(m => m.TutorDetailComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'tutores/:id/editar',
    loadComponent: () => import('./features/tutores/tutor-form/tutor-form').then(m => m.TutorFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];