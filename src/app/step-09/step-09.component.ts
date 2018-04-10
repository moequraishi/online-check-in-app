import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';

/* HTTP Client to retrieve data */
import { HttpClient, HttpRequest, HttpEvent, HttpEventType } from '@angular/common/http';

/* Data Service */
import { DataService } from '../data.service';

/* Angular Material */
import { MatSnackBar } from '@angular/material';


@Component({
  selector: 'app-step-09',
  templateUrl: './step-09.component.html',
  styleUrls: ['./step-09.component.scss']
})
export class Step09Component implements OnInit {

	// Setting the FlowStep
	flowStep:string = '8';
	flowStepResults:any={};
	getFlowStepNumber:string;

	// Survey Data and Variables
	surveyResults:any = {};
	preReg:string;

	// Registration Data
	regData:any = {};

	// Tentstatus Variable
	tentStatus:string;

	// Check-in Status Data
	updateRegRes:any = {};

	constructor(private data: DataService, private http: HttpClient, private router: Router, public snackBar: MatSnackBar) { }

	ngOnInit() {

		// Checking logged in state, and running correct functions
		if (this.data.isLoggedIn() === true && this.data.tokenExpired === false) {
			
			// If user is logged in, then get the current flowStep (to prevent people from skipping pages)
			this.getFlowStep();
		} else if (this.data.storageToken === undefined) {
			console.log('Auth Token Expired.');

			this.snackBar.open("Login session expired, please login again.", "Close", {
                duration: 3500,
                extraClasses: ['error-info']
            });
			this.router.navigate(['/step-01']);

		} else {
			// if not logged in, go back to step 1 (login page)
			// console.log('You are not logged in, get outta here!');
			this.snackBar.open("You are not logged in, please login.", "Close", {
                duration: 3500,
                extraClasses: ['error-info']
            });
			this.router.navigate(['/step-01']);
		}
		
	}

	// Get the Survey Responses
	getSurveyRes() {
		this.data.method = 'CRTeamraiserAPI?method=getSurveyResponses&api_key=cfrca&v=1.0&fr_id=' + this.data.eventID + '&sso_auth_token=' + this.data.ssoToken + '&survey_id=82857' + '&response_format=json';
		this.http.post(this.data.convioURL + this.data.method, null)
			.subscribe(res => {
				this.surveyResults = res;

				// Accepted Upsell Offer (for Pre-register question)
				for (let result of this.surveyResults.getSurveyResponsesResponse.responses) {
					if (result.questionId === this.data.question6) {
						this.preReg = result.responseValue;
					}
				}

			}, (err) => {
				console.log(err);
			});
	}

	// Update the current Flowstep
	updateFlowStep() {
		this.data.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0&fr_id=' + this.data.eventID + '&sso_auth_token=' + this.data.ssoToken + '&flow_step=' + this.flowStep + '&response_format=json';
		this.http.post(this.data.convioURL + this.data.method, null) 
			.subscribe(res => {
				// console.log('Flow step updated.')
			}, (err) => {
				if (err) {
					console.log('There was an error updating the flowstep.');
				}
			});
	}

	// Set checkInStatus as Complete
	updateCheckInStatusComplete() {
		this.data.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.data.eventID + '&sso_auth_token=' + this.data.ssoToken + '&checkin_status=complete' + '&response_format=json';
		this.http.post(this.data.convioURL + this.data.method, null) 
			.subscribe(res => {
				this.updateRegRes = res;
				// console.log(this.updateRegRes);
				// window.location.reload();
			});
	}

	// Get the current Flowstep
	getFlowStep() {
		const token = localStorage.getItem('token');
		this.data.method = 'CRTeamraiserAPI?method=getFlowStep&api_key=cfrca&v=1.0&response_format=json&fr_id='+ this.data.eventID + '&sso_auth_token='+ token;
		this.http.post(this.data.convioURL + this.data.method, null)
			.subscribe(res => {
				this.flowStepResults = res;
				this.getFlowStepNumber = this.flowStepResults.getFlowStepResponse.flowStep;

				// Checking the participants flow step to prevent user from skipping a flowstep
				if (this.getFlowStepNumber === this.flowStep) {
					
					// If the flow step matches to where they are supposed to be, then run the functions for the current route below
					this.updateFlowStep();
					this.updateCheckInStatusComplete();
					this.getSurveyRes();
					this.data.getUserInfo();
					this.data.getRegInfo();
					this.data.getTeam();
				} else {
					
					// If flowstep does not match, show error message and kick them back to the previous page/flowstep.
					this.snackBar.open("Please don't try to skip pages.", "Close", {
                        duration: 3500,
                        extraClasses: ['error-info']
               		});

					// Send user to the start (to prevent API errors)
					this.router.navigate(['/step-02']);
				}

			}, (err) => {
				console.log(err);

				// If flowstep has error, log out the user (to prevent API errors)
				this.data.logOut();
			});
	}

	// Print Method
	print() {
	    window.print();
	}

}
