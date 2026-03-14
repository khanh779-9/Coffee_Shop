import { Routes } from '@angular/router';
import { adminAuthGuard } from './core/admin-auth.guard';
import { AdminContentComponent } from './pages/admin-content/admin-content.component';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { AdminOrdersComponent } from './pages/admin-orders/admin-orders.component';
import { HomeComponent } from './pages/home/home.component';
import { OrderComponent } from './pages/order/order.component';

export const routes: Routes = [
	{
		path: '',
		component: HomeComponent
	},
	{
		path: 'order',
		component: OrderComponent
	},
	{
		path: 'admin/login',
		component: AdminLoginComponent
	},
	{
		path: 'admin/orders',
		component: AdminOrdersComponent,
		canActivate: [adminAuthGuard]
	},
	{
		path: 'admin/content',
		component: AdminContentComponent,
		canActivate: [adminAuthGuard]
	},
	{
		path: '**',
		redirectTo: ''
	}
];
