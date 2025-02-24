import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AppFlowService } from "./services/app-flow-service";
import { SoundService } from "./services/sounds/sound-service";
import { WidgetService } from "./services/widgets/widget-service";
import { SocketService } from "./services/requests/socket-service";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot({
    mode: "ios"
  }), AppRoutingModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, SoundService, WidgetService, SocketService, AppFlowService],
  bootstrap: [AppComponent],
})
export class AppModule {
}
