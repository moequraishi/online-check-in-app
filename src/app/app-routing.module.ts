import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Step01Component } from './step-01/step-01.component';
import { Step02Component } from './step-02/step-02.component';
import { Step03Component } from './step-03/step-03.component';
import { Step04Component } from './step-04/step-04.component';
import { Step05Component } from './step-05/step-05.component';
import { Step06Component } from './step-06/step-06.component';
import { Step07Component } from './step-07/step-07.component';
import { Step08Component } from './step-08/step-08.component';
import { Step09Component } from './step-09/step-09.component';

const routes: Routes = [
	{ path: 'step-01', component: Step01Component, data: { page: 'one' } },
	{ path: 'step-02', component: Step02Component, data: { page: 'two' } },
	{ path: 'step-03', component: Step03Component, data: { page: 'three' } },
	{ path: 'step-04', component: Step04Component, data: { page: 'four' } },
	{ path: 'step-05', component: Step05Component, data: { page: 'five' } },
	{ path: 'step-06', component: Step06Component, data: { page: 'six' } },
	{ path: 'step-07', component: Step07Component, data: { page: 'seven' } },
	{ path: 'step-08', component: Step08Component, data: { page: 'eight' } },
	{ path: 'step-09', component: Step09Component, data: { page: 'nine' } },
	{ path: '', redirectTo: '/step-01', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
  	useHash: true
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
