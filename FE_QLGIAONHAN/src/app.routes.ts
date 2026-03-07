// import { Routes } from '@angular/router';

// export const routes: Routes = [

//   // redirect root → login
//   {
//     path: '',
//     redirectTo: 'login',
//     pathMatch: 'full'
//   },

//   // Login
//   {
//     path: 'login',
//     loadComponent: () =>
//       import('./components/login/login.component')
//         .then(m => m.LoginComponent)
//   },

//   // Layout wrapper
//   {
//     path: '',
//     loadComponent: () =>
//       import('./components/layout/layout.component')
//         .then(m => m.LayoutComponent),
//     children: [
//       {
//         path: 'dashboard',
//         loadComponent: () =>
//           import('./components/dashboard/dashboard.component')
//             .then(m => m.DashboardComponent)
//       },
//       {
//         path: 'orders',
//         loadComponent: () =>
//           import('./components/order-list/order-list.component')
//             .then(m => m.OrderListComponent)
//       },
//       {
//         path: 'logs',
//         loadComponent: () =>
//           import('./components/activity-log/activity-log.component')
//             .then(m => m.ActivityLogComponent)
//       },
//       {
//         path: 'users',
//         loadComponent: () =>
//           import('./components/user-management/user-management.component')
//             .then(m => m.UserManagementComponent)
//       },
//       {
//         path: 'guide',
//         loadComponent: () =>
//           import('./components/guide/guide.component')
//             .then(m => m.GuideComponent)
//       }
//     ]
//   }
// ];

import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component')
        .then(m => m.LoginComponent)
  },

  {
    path: '',
    canActivate: [authGuard],  
    loadComponent: () =>
      import('./components/layout/layout.component')
        .then(m => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./components/order-list/order-list.component')
            .then(m => m.OrderListComponent)
      },
      {
        path: 'logs',
        loadComponent: () =>
          import('./components/activity-log/activity-log.component')
            .then(m => m.ActivityLogComponent)
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./components/user-management/user-management.component')
            .then(m => m.UserManagementComponent)
      },
      {
        path: 'guide',
        loadComponent: () =>
          import('./components/guide/guide.component')
            .then(m => m.GuideComponent)
      }
    ]
  }
];