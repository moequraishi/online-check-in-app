import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl,FormGroup, FormGroupDirective, NgForm, Validators  } from '@angular/forms';
import { HttpClient, HttpRequest, HttpEvent, HttpEventType } from '@angular/common/http';

/* Angular Material */
import { MatSnackBar } from '@angular/material';
import { ErrorStateMatcher } from '@angular/material/core';

/* Data Service */
import { DataService } from '../data.service';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-step-06',
  templateUrl: './step-06.component.html',
  styleUrls: ['./step-06.component.scss']
})
export class Step06Component implements OnInit {

	// Setting the FlowStep
	flowStep:string = '5';
	flowStepResults:any={};
	getFlowStepNumber:string;

	// Error state matcher for the form validation
	matcher = new MyErrorStateMatcher();

	// Defining variables tied with the DOM
	upsellResults:string;
	upsellHiddenResult:string;
	hiddenUpsellValue:string;

	// Defining the formgroup
	upsellForm: FormGroup;

	// Radio Button Options
	upsells = [
	    {value: '1441', viewValue: 'Register for $10 (online only)'},
	    {value: '1443', viewValue: 'Donate $100 (registration fee waived)'},
	    {value: '0', viewValue: 'No, thank you.'}
	];

	// Results from getSurvey
	surveyResults:any = {};

	// Token from the Storage
	storageToken:string = localStorage.getItem('token');

	constructor(
		private data: DataService, 
		private http: HttpClient, 
		private route: Router, 
		public snackBar: MatSnackBar) { }

	ngOnInit() {

		window.scrollTo(0,0);

		// Checking logged in state, and running correct functions
		if (this.data.isLoggedIn() === true && this.data.tokenExpired === false) {
			// console.log('You are logged in!');

			this.getFlowStep();

			// this.dataService.getParticipationType();
		} else if (this.data.storageToken === undefined) {
			this.snackBar.open("Login session expired, please login again.", "Close", {
                duration: 3500,
                extraClasses: ['error-info']
            });
			this.route.navigate(['/step-01']);

		} else {
			// if not logged in, go back to step 1 (login page)
			this.snackBar.open("You are not logged in, please login.", "Close", {
                duration: 3500,
                extraClasses: ['error-info']
            });
			this.route.navigate(['/step-01']);
		}

		// Defining Upsell FormGroup
		this.upsellForm = new FormGroup({
			upsellSelect: new FormControl(null, Validators.required)
		});

	}

	getSurveyRes() {
		this.data.method = 'CRTeamraiserAPI?method=getSurveyResponses&api_key=cfrca&v=1.0&fr_id=' + this.data.eventID + '&survey_id=' + this.data.surveyID + '&sso_auth_token=' + this.data.ssoToken + '&response_format=json';
		this.http.post(this.data.convioURL + this.data.method, null)
			.subscribe(res => {
				this.surveyResults = res;

				// For loop to loop through the responded data from API call
				for (let data of this.surveyResults.getSurveyResponsesResponse.responses) {
					// If questionId is same as waiver question ID in Survey then check if fullName variable is undefined or null, if so set it as the response value else if it's length is equil to 0 or no reponseValue, then set it to a blank string
					if (data.questionId === this.data.question16) {
						if (data.responseValue === '[object Object]') {
							this.upsellResults = '';
						}
						if (this.upsellResults === undefined || null) {
							this.upsellResults = data.responseValue;
						}

						if (data.responseValue === this.data.hiddenUpsellID || data.responseValue === this.data.hiddenUpsellID2) {
							this.upsellHiddenResult = 'Yes';
						}

						if (data.responseValue === '0') {
							this.upsellHiddenResult = 'No';
						}

						if (Object.keys(data.responseValue).length === 0) {
							this.upsellResults = null;
							console.log('Nothing has been selected for upsell.');
						}
					}
				}

			}, 
			(err) => {
				console.log('There was an error!');
				if (err.status === 403) {

					this.data.logOut();
					this.snackBar.open("Your login session has expired. Please login again.", "Close", {
                        duration: 13500,
                        extraClasses: ['error-info']
               		});
               		this.route.navigate(['/step-01']);
				}
			});
	}

	updateSurveyRes() {
		if (this.upsellResults === this.data.hiddenUpsellID || this.upsellResults === this.data.hiddenUpsellID2) {
			this.upsellHiddenResult = 'Yes'; 
		}
		if (this.upsellResults === '0') {
			this.upsellHiddenResult = 'No'; 
		}

		// Constant variable for the upsell question response and ID
		const question_hidden_upsell = '&question_'+ this.data.question16 + '=' + this.upsellResults;
		const question_accepted_upsell = '&question_'+ this.data.question6 + '=' + this.upsellHiddenResult;

		var updateSurveyResponsesUrl = 'https://secure2.convio.net/cfrca/site/CRTeamraiserAPI?method=updateSurveyResponses&api_key=cfrca&v=1.0&response_format=json&fr_id=' + this.data.eventID;

		this.http.post(updateSurveyResponsesUrl + question_hidden_upsell + question_accepted_upsell + '&survey_id=' + this.data.surveyID + '&sso_auth_token=' + this.data.ssoToken, null)
			.subscribe(res => {
				this.surveyResults = res;

				this.snackBar.open("Your information has been saved!", "Close", {
                        duration: 3500,
                        extraClasses: ['saved-info']
                });

                // Route user to next route once http post is successful
				this.nextFlowStep();
			}, (error) => {
				console.log(error);
			});
	}

	// Save the current Survey Responses
	saveSurveyResponses() {
		if (this.upsellResults === this.data.hiddenUpsellID || this.upsellResults === this.data.hiddenUpsellID2) {
			this.upsellHiddenResult = 'Yes'; 
		} 
		if (this.upsellResults === '0') {
			this.upsellHiddenResult = 'No'; 
		}
		console.log(this.upsellHiddenResult);
		// Constant variable for the upsell question response and ID
		const question_hidden_upsell = '&question_'+ this.data.question16 + '=' + this.upsellResults;
		const question_accepted_upsell = '&question_'+ this.data.question6 + '=' + this.upsellHiddenResult;

		var updateSurveyResponsesUrl = 'https://secure2.convio.net/cfrca/site/CRTeamraiserAPI?method=updateSurveyResponses&api_key=cfrca&v=1.0&response_format=json&fr_id=' + this.data.eventID;

		this.http.post(updateSurveyResponsesUrl + question_hidden_upsell + question_accepted_upsell+ '&survey_id=' + this.data.surveyID + '&sso_auth_token=' + this.data.ssoToken, null)
			.subscribe(res => {
				this.surveyResults = res;

				this.snackBar.open("Your information has been saved!", "Close", {
                        duration: 3500,
                        extraClasses: ['saved-info']
                });
                
				window.location.reload();
			}, 
			error => {
				console.log('There was an error');
			});
	}

	// Update the current Flowstep
	updateFlowStep() {
		this.data.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.data.eventID + '&sso_auth_token=' + this.storageToken + '&flow_step=' + this.flowStep + '&response_format=json';
		this.http.post(this.data.convioURL + this.data.method, null) 
			.subscribe(res => {
				// console.log('Flow step updated.')
			}, (err) => {
				if (err) {
					console.log(err);
				}
			});
	}

	// Update the flowStep to the next flowStep once everything checks out
	nextFlowStep() {
		this.flowStep = '6';
		this.data.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.data.eventID + '&sso_auth_token=' + this.storageToken + '&flow_step=' + this.flowStep + '&response_format=json';
		this.http.post(this.data.convioURL + this.data.method, null) 
			.subscribe(res => {
				// Update the flowStep to the next flowstep once everything checks out properly
				this.route.navigate(['/step-07']);
			}, (err) => {
				if (err) {
					console.log('There was an error updating the flowstep.');
				}
			});
	}

	// Update the current Flowstep
	previousFlowStep() {
		this.flowStep = '4';
		this.data.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.data.eventID + '&sso_auth_token=' + this.storageToken + '&flow_step=' + this.flowStep + '&response_format=json';
		this.http.post(this.data.convioURL + this.data.method, null) 
			.subscribe(res => {

				// Route user to previous flow step
				this.route.navigate(['/step-05']);
			}, (err) => {
				if (err) {
					console.log('There was an error updating the flowstep.');
				}
			});
	}

	// Get the current Flowstep
	getFlowStep() {
		this.data.method = 'CRTeamraiserAPI?method=getFlowStep&api_key=cfrca&v=1.0&response_format=json&fr_id='+ this.data.eventID + '&sso_auth_token='+ this.storageToken;
		this.http.post(this.data.convioURL + this.data.method, null)
			.subscribe(res => {
				this.flowStepResults = res;
				this.getFlowStepNumber = this.flowStepResults.getFlowStepResponse.flowStep;

				// Checking the participants flow step to prevent user from skipping a flowstep
				if (this.getFlowStepNumber === this.flowStep) {
					// If the flow step matches to where they are supposed to be, then run the functions for the page below
					this.getSurveyRes();
					this.updateFlowStep();
				} else {
					// If flowstep does not match, show error message and kick them back to the previous page/flowstep.
					this.snackBar.open("Please don't try to skip pages.", "Close", {
                        duration: 3500,
                        extraClasses: ['error-info']
               		});

					// Send user to the start (to prevent API errors)
					this.route.navigate(['/step-02']);
				}

			}, (err) => {
				console.log(err);

				// If flowstep has error, log out the user (to prevent API errors)
				this.data.logOut();
			});
	}

}
