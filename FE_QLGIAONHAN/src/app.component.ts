import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { OrderListComponent } from './components/order-list/order-list.component';
import { OrderDetailComponent } from './components/order-detail/order-detail.component';
import { OrderFormComponent } from './components/order-form/order-form.component';
import { ActivityLogComponent } from './components/activity-log/activity-log.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { GuideComponent } from './components/guide/guide.component';
import { AuthService } from './services/auth.service';
// import { DataService, Order, ViewState } from './services/data.service';
import { OrderService } from './services/order.service';
import { ViewStateService } from './services/view-state.service'
import { Order, ViewState } from './type/models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    LoginComponent,
    LayoutComponent,
    OrderListComponent,
    OrderDetailComponent,
    OrderFormComponent,
    ActivityLogComponent,
    DashboardComponent,
    UserManagementComponent,
    GuideComponent
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  authService = inject(AuthService);
  viewStateService = inject(ViewStateService);
  orderService = inject(OrderService);

  isLoggedIn = this.authService.isLoggedIn;
  currentUser = this.authService.currentUser;

  // View State - mapped to DataService
  currentView = this.viewStateService.activeView;

  // Modal State
  selectedOrder = signal<Order | null>(null);
  showCreateForm = signal(false);
  editingOrder = signal<Order | null>(null);

  onLogout() {
    this.authService.logout();
    this.resetViews();
  }

  resetViews() {
    this.selectedOrder.set(null);
    this.showCreateForm.set(false);
    this.editingOrder.set(null);
    this.currentView.set('DASHBOARD');
  }

  // Navigation
  setView(view: string) {
    this.currentView.set(view as ViewState);
  }

  // Actions
  openCreateForm() {
    this.showCreateForm.set(true);
  }

  closeForm() {
    this.showCreateForm.set(false);
    this.editingOrder.set(null);
  }

  selectOrder(order: Order) {
    this.selectedOrder.set(order);
  }

  closeDetail() {
    this.selectedOrder.set(null);
    this.editingOrder.set(null);
    this.showCreateForm.set(false);
  }

  // Edit flow: Detail -> Edit Form
  startEdit(order: Order) {
    this.selectedOrder.set(null); // Close detail
    this.editingOrder.set(order); // Set data for form
    this.showCreateForm.set(true); // Open form
  }

  saveOrder(orderData: Partial<Order>) {
    if (this.editingOrder()) {
      this.orderService.updateOrder(this.editingOrder()!.id, orderData);
    } else {
      this.orderService.addOrder(orderData);
      // After creating, switch to ORDERS view to see it
      this.currentView.set('ORDERS');
    }
    this.closeForm();
    this.selectedOrder.set(null); // Close detail if open
  }
}