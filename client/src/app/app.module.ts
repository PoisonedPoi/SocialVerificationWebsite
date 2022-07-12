import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TitleBarComponent } from './title-bar/title-bar.component';
import { DesignerComponent } from './designer/designer.component';
import { AuthComponent } from './auth/auth.component';
import { StatusBarComponent } from './designer/status-bar/status-bar.component';
import { ActionsBarComponent } from './designer/actions-bar/actions-bar.component';
import { MicrointeractionSelectorComponent } from './designer/microinteraction-selector/microinteraction-selector.component';
import { InteractionCanvasComponent } from './designer/interaction-canvas/interaction-canvas.component';
import { InteractionOptionsComponent } from './designer/interaction-options/interaction-options.component';

@NgModule({
  declarations: [
    AppComponent,
    TitleBarComponent,
    DesignerComponent,
    AuthComponent,
    StatusBarComponent,
    ActionsBarComponent,
    MicrointeractionSelectorComponent,
    InteractionCanvasComponent,
    InteractionOptionsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
