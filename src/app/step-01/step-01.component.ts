import { Component, OnInit, Input } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent, HttpEventType } from '@angular/common/http';
import { FormGroup, FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Router } from '@angular/router';
import { DataService } from '../data.service';


/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-step-01',
  templateUrl: './step-01.component.html',
  styleUrls: ['./step-01.component.scss']
})
export class Step01Component implements OnInit {
	// Locale boolean
	hide = true;

	// FormGroup for Validation
	loginForm: FormGroup;

	// Matching the Error state
	matcher = new MyErrorStateMatcher();

	constructor(private dataService: DataService, private http: HttpClient, private router: Router) {
		
		// Checking if the user is logged in, if so go to step 2
		if (this.dataService.isLoggedIn() === true && this.dataService.tokenExpired === false) {
			console.log('Step 1: You are logged in already...');
			this.router.navigate(['/step-02']);
		}
	}

	ngOnInit() {
		// Setting the FormGroup properties
		this.loginForm = new FormGroup({
			username: new FormControl('', Validators.required),
			password: new FormControl('', Validators.required)
		});

	}

	@Input() isVisible : boolean = true;
	
	// Calling on the isLoggedIn() function from the global data service to check the logged in state
	isLoggedIn() {
		return this.dataService.isLoggedIn();
	}
}
