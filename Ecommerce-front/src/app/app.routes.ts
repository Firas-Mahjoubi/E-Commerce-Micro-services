import { Routes } from '@angular/router';
import { authGuard, guestGuard } from '@core/guards/auth.guard';
import { sellerGuard, adminGuard } from '@core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'products',
    loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./features/products/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'orders',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  // Seller Routes
  {
    path: 'seller',
    canActivate: [authGuard, sellerGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/seller/seller-dashboard/seller-dashboard.component').then(m => m.SellerDashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./features/seller/seller-products/seller-products.component').then(m => m.SellerProductsComponent)
      },
      {
        path: 'products/add',
        loadComponent: () => import('./features/seller/add-product/add-product.component').then(m => m.AddProductComponent)
      },
      {
        path: 'products/edit/:id',
        loadComponent: () => import('./features/seller/edit-product/edit-product.component').then(m => m.EditProductComponent)
      },
      {
        path: 'products/:id',
        loadComponent: () => import('./features/seller/product-detail/product-detail.component').then(m => m.SellerProductDetailComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/seller/seller-profile/seller-profile.component').then(m => m.SellerProfileComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) // Placeholder
      }
    ]
  },
  // Admin Routes
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/user-list/user-list.component').then(m => m.UserListComponent)
      },
      {
        path: 'users/create',
        loadComponent: () => import('./features/admin/create-user/create-user.component').then(m => m.CreateUserComponent)
      },
      {
        path: 'users/edit/:id',
        loadComponent: () => import('./features/admin/edit-user/edit-user.component').then(m => m.EditUserComponent)
      },
      {
        path: 'users/:id',
        loadComponent: () => import('./features/admin/user-detail/user-detail.component').then(m => m.UserDetailComponent)
      },
      {
        path: 'customers',
        loadComponent: () => import('./features/admin/user-list/user-list.component').then(m => m.UserListComponent)
      },
      {
        path: 'sellers',
        loadComponent: () => import('./features/admin/user-list/user-list.component').then(m => m.UserListComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
