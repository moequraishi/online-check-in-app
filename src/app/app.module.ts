import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatStepperModule,
} from '@angular/material';
import {CdkTableModule} from '@angular/cdk/table';

// HTTP Methods and Modules
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { HttpClientModule, HttpClient, HttpRequest } from '@angular/common/http';

// Routing Modules
import { AppRoutingModule } from './app-routing.module';

// Data Service
import { DataService } from './data.service';

// Components
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { StepperComponent } from './stepper/stepper.component';
import { Step01Component } from './step-01/step-01.component';
import { Step02Component, Step02Dialog } from './step-02/step-02.component';
import { Step03Component } from './step-03/step-03.component';
import { Step04Component } from './step-04/step-04.component';
import { Step05Component } from './step-05/step-05.component';
import { Step06Component } from './step-06/step-06.component';
import { Step07Component } from './step-07/step-07.component';
import { Step08Component } from './step-08/step-08.component';
import { Step09Component } from './step-09/step-09.component';

@NgModule({
  exports: [
    CdkTableModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    BrowserModule,
  ],
  declarations: []
})
export class ngMaterialModule {}

@NgModule({
  declarations: [
    AppComponent,
    Step01Component,
    Step02Component,
    Step02Dialog,
    Step03Component,
    Step04Component,
    Step05Component,
    Step06Component,
    Step07Component,
    Step08Component,
    Step09Component,
    HeaderComponent,
    StepperComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ngMaterialModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  entryComponents: [Step01Component, Step02Dialog],
  providers: [DataService, Http],
  bootstrap: [AppComponent]
})
export class AppModule { }
