import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TitleBarComponent } from './components/title-bar/title-bar.component';
import { DesignerComponent } from './components/designer/designer.component';
import { AuthComponent } from './components/auth/auth.component';
import { StatusBarComponent } from './components/designer/status-bar/status-bar.component';
import { ActionsBarComponent } from './components/designer/actions-bar/actions-bar.component';
import { MicrointeractionSelectorComponent } from './components/designer/microinteraction-selector/microinteraction-selector.component';
import { InteractionCanvasComponent } from './components/designer/interaction-canvas/interaction-canvas.component';
import { InteractionOptionsComponent } from './components/designer/interaction-options/interaction-options.component';
import { ViolationOutputComponent } from './components/designer/violation-output/violation-output.component';
import { RobotViewerComponent } from './components/designer/robot-viewer/robot-viewer.component';
import { GroupComponent } from './components/designer/interaction-canvas/group/group.component';
import { TransitionComponent } from './components/designer/interaction-canvas/transition/transition.component';

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
    InteractionOptionsComponent,
    ViolationOutputComponent,
    RobotViewerComponent,
    GroupComponent,
    TransitionComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
