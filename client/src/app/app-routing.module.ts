import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { DesignerComponent } from './components/designer/designer.component';

const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: 'designer', component: DesignerComponent },
  { path: '', redirectTo: 'designer', pathMatch: 'full' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
