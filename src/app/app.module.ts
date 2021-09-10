import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CreatePollComponent } from './create-poll/create-poll.component';
import { HomeComponent } from './home/home.component';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { PollCardComponent } from './poll-card/poll-card.component';
import { ViewPollComponent } from './view-poll/view-poll.component';
import { PollResultsComponent } from './poll-results/poll-results.component';
import { ChartComponent } from './chart/chart.component';
import { CreateFormComponent } from './create-form/create-form.component';
import { PadPipe } from './pipes/pad.pipe';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { GoogleMapsModule } from '@angular/google-maps';
import { LayoutModule } from '@angular/cdk/layout';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { AppMaterialModule } from './app-material/app-material.module';
import { FormCardComponent } from './form-card/form-card.component';

@NgModule({
  declarations: [
    AppComponent,
    CreatePollComponent,
    HomeComponent,
    PollCardComponent,
    ViewPollComponent,
    PollResultsComponent,
    ChartComponent,
    PadPipe,
    CreateFormComponent,
    FormCardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AppMaterialModule,
    LayoutModule,
    ReactiveFormsModule,
    OverlayModule,
    HttpClientModule,
    HttpClientJsonpModule,
    DragDropModule,
    GoogleMapsModule,
    NgxChartsModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
