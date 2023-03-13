import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { SingleServerComponent } from './admin/containers/single-server/single-server.component';
import { AllServersComponent } from './admin/containers/all-servers/all-servers.component';
import { FooterComponent } from './admin/components/footer/footer.component';
import { HeaderComponent } from './admin/components/header/header.component';
import { ServerBaseComponent } from './admin/containers/server-base/server-base.component';

@NgModule({
  declarations: [
    AppComponent,
    SingleServerComponent,
    AllServersComponent,
    FooterComponent,
    HeaderComponent,
    ServerBaseComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
