import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { AdminLayout } from './layout/admin-layout/admin-layout';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [

  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/pages/register/register')
        .then(m => m.Register)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login')
        .then(m => m.Login)
  },

  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home/pages/home/home')
            .then(m => m.Home)
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/pages/forgot-password/forgot-password')
            .then(m => m.ForgotPassword)
      },
      {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/users/pages/dashboard/dashboard')
            .then(m => m.Dashboard)
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/users/pages/profile/profile')
            .then(m => m.Profile)
      },
      {
        path: 'profile/edit',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/users/pages/edit-profile/edit-profile')
            .then(m => m.EditProfile)
      },
      {
        path: 'my-listings',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/offers/pages/offers-list/offers-list')
            .then(m => m.OffersList)
      },
      {
        path: 'messages',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/messaging/pages/chat/chat')
            .then(m => m.Chat)
      },
      {
        path: 'notifications',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/notifications/pages/notifications/notifications')
            .then(m => m.Notifications)
      },
      {
        path: 'offers',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/offers/pages/offers-list/offers-list')
            .then(m => m.OffersList)
      },
      {
        path: 'search',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/search/pages/search-results/search-results')
            .then(m => m.SearchResults)
      },
      {
        path: 'offers/edit/:id',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/offers/pages/offer-create/offer-create')
            .then(m => m.OfferCreate)
      },
      {
        path: 'offers/create',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/offers/pages/offer-create/offer-create')
            .then(m => m.OfferCreate)
      },
      {
        path: 'offers/:id',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/offers/pages/offer-details/offer-details')
            .then(m => m.OfferDetails)
      }
    ]
  },

  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/pages/admin-dashboard/admin-dashboard')
            .then(m => m.AdminDashboard)
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/pages/manage-users/manage-users')
            .then(m => m.ManageUsers)
      },
      {
        path: 'offers',
        loadComponent: () =>
          import('./features/admin/pages/manage-offers/manage-offers')
            .then(m => m.ManageOffers)
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/admin/pages/reports/reports')
            .then(m => m.Reports)
      }
    ]
  },

  {
    path: '**',
    redirectTo: ''
  }
];
