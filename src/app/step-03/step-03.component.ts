import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { HttpClient, HttpRequest, HttpEvent, HttpEventType } from '@angular/common/http';
import { ErrorStateMatcher } from '@angular/material/core';

import { DataService } from '../data.service';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-step-03',
  templateUrl: './step-03.component.html',
  styleUrls: ['./step-03.component.scss']
})
export class Step03Component implements OnInit {

	step03Form: FormGroup;

	matcher = new MyErrorStateMatcher();

	buttonStatus:boolean = true;

	// Flowstep
	flowStep:string= '2';
	flowStepResults:any={};
	getFlowStepNumber:string;

	// Results from HTTP calls set as Objects for OOP
	surveyResults:any = {};
	regRes:any = {};

	// DOM Element Responses
	cancerRes:string;
	vegRes:string;
	shuttleRes:string;
	shuttleRes2:string;
	shuttleRes3:string;
	shuttleRes4:string;
	shuttleRes5:string;
	jerseyRes:string;
	attendenceRes:string;
	routeRes:string;
	experiencedRiderRes:string;

	emergencyName:string;
	emergencyPhone:string;

	// Select Options for Yes/No
	matSelect = [
		{value: 'Yes', viewValue: 'Yes'},
    {value: 'No', viewValue: 'No'}
	]

	// Select Options for Jesey Sizes
	jerseySelect = [
		  {value: 'XS', viewValue: 'XS'},
	    {value: 'S', viewValue: 'S'},
	    {value: 'M', viewValue: 'M'},
	    {value: 'L', viewValue: 'L'},
	    {value: 'XL', viewValue: 'XL'},
	    {value: '2XL', viewValue: '2XL'},
	    {value: '3XL', viewValue: '3XL'}
	]

	// Radio Button Options
	routes = [
	    {value: '1', viewValue: 'Classic'},
	    {value: '2', viewValue: 'Challenge'},
	    {value: '3', viewValue: 'Crew Member Only'}
	];

	// Years attended Options
	years = [
	    {value: '1', viewValue: '1'},
	    {value: '2', viewValue: '2'},
	    {value: '3', viewValue: '3'},
	    {value: '4', viewValue: '4'},
	    {value: '5', viewValue: '5'},
	    {value: '6', viewValue: '6'},
	    {value: '7', viewValue: '7'},
	    {value: '8', viewValue: '8'},
	    {value: '9', viewValue: '9'},
	    {value: '10', viewValue: '10'},
	    {value: '11', viewValue: '11'}
	];

	// Specifying API Method Variable
	method:string;

	constructor(private dataService: DataService, private route: Router, private http: HttpClient, public snackBar: MatSnackBar) {
	}

	ngOnInit() {

		window.scrollTo(0,0);

		this.step03Form = new FormGroup({
			emergencyName: new FormControl(this.emergencyName, Validators.required),
			emergencyPhone: new FormControl(this.emergencyPhone, Validators.required),
			yearsAttended: new FormControl(null, Validators.required),
			routeSelect: new FormControl(null, Validators.required),
			cancerSurvivor: new FormControl(this.cancerRes),
			vegMeals: new FormControl(this.vegRes),
			jerseySizes: new FormControl(this.jerseyRes),
			shuttle1: new FormControl(this.shuttleRes),
			shuttle2: new FormControl(this.shuttleRes2),
			shuttle3: new FormControl(this.shuttleRes3),
			shuttle4: new FormControl(this.shuttleRes4),
			shuttle5: new FormControl(this.shuttleRes5),
			experienced: new FormControl(this.experiencedRiderRes)
		});

		// Checking logged in state, if they are logged in run regInfo() and getUserInfo() functions from the global dataService.
		if (this.dataService.isLoggedIn() === true && this.dataService.tokenExpired === false) {

			// Get the current flowstep
			this.getFlowStep();

			this.dataService.getParticipationType();
		} else if (this.dataService.storageToken === undefined) {
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

	}

	ngAfterViewInit() {
		// console.log(this.step03Form);
		// console.log(this.step03Form.value.jerseySizes);
		if (this.step03Form.controls.jerseySizes.value === '[object Object]') {
			this.jerseyRes = '';
			console.log('jersey response is an empty object');
		}
	}

	// Get the Survey Responses
	getSurveyRes() {
		this.method = 'CRTeamraiserAPI?method=getSurveyResponses&api_key=cfrca&v=1.0&fr_id=' + this.dataService.eventID + '&sso_auth_token=' + this.dataService.ssoToken + '&survey_id=82857' + '&response_format=json';
		this.http.post(this.dataService.convioURL + this.method, null)
			.subscribe(res => {
				this.surveyResults = res;

				// For loop to get Survey Data and set it to the correct variables (this is important for data to be retrieved and displayed in the DOM properly). It checks if the data exists already to set it to the proper element in the DOM, if the data does NOT exist, set is as blank (null or undefined causes issues).

				for (let res of this.surveyResults.getSurveyResponsesResponse.responses) {

					// Cancer Survivor
					if (res.questionId === this.dataService.question14) {
						if (this.cancerRes === undefined) {
							this.cancerRes = res.responseValue;
						}
						if (Object.keys(res.responseValue).length === 0) {
							this.cancerRes = '';
						}
					}

					// Vegetarian Meals
					if (res.questionId === this.dataService.question14) {
						if (this.vegRes === undefined) {
							this.vegRes = res.responseValue;
						}
						if (Object.keys(res.responseValue).length === 0) {
							this.vegRes = '';
						}
					}

					// How many years have you ridden with The Ride?
					if (res.questionId === this.dataService.question1) {
						this.attendenceRes = res.responseValue;
						if (this.attendenceRes === undefined || null) {
							this.attendenceRes = '';
						}
						if (Object.keys(res.responseValue).length === 0) {
							this.attendenceRes = '';
						}
					}

					// Jersey Selection
					if (res.questionId === this.dataService.question18) {

						if (this.jerseyRes === '[object Object]') {
							console.log('jersey empty object');
						}

						if (this.jerseyRes === undefined || null) {
							this.jerseyRes = res.responseValue;
						}
						if (Object.keys(res.responseValue).length === 0) {
							this.jerseyRes = '';
						}
						this.jerseyRes = res.responseValue;
					}

					// Shuttle 1 Selection
					if (res.questionId === this.dataService.question19) {
						this.shuttleRes = res.responseValue;
						if (this.shuttleRes === undefined || null) {
							this.shuttleRes = res.responseValue;
						}
						if (Object.keys(res.responseValue).length === 0) {
							this.shuttleRes = '';
						}
					}

					// Shuttle 2 Selection
					if (res.questionId === this.dataService.question20) {
						this.shuttleRes2 = res.responseValue;
						if (this.shuttleRes2 === undefined || null) {
							this.shuttleRes2 = res.responseValue;
						}
						if (Object.keys(res.responseValue).length === 0) {
							this.shuttleRes2 = '';
						}
					}

					// Shuttle 3 Selection
					if (res.questionId === this.dataService.question21) {
						this.shuttleRes3 = res.responseValue;
						if (this.shuttleRes3 === undefined || null) {
							this.shuttleRes3 = res.responseValue;
						}
						if (Object.keys(res.responseValue).length === 0) {
							this.shuttleRes3 = '';
						}
					}

					// Shuttle 4 Selection
					if (res.questionId === this.dataService.question22) {
						this.shuttleRes4 = res.responseValue;
						if (this.shuttleRes4 === undefined || null) {
							this.shuttleRes4 = res.responseValue;
						}
						if (Object.keys(res.responseValue).length === 0) {
							this.shuttleRes4 = '';
						}
					}

					// Shuttle 5 Selection
					if (res.questionId === this.dataService.question23) {
						this.shuttleRes5 = res.responseValue;
						if (this.shuttleRes5 === undefined || null) {
							this.shuttleRes5 = res.responseValue;
						}
						if (Object.keys(res.responseValue).length === 0) {
							this.shuttleRes5 = '';
						}
					}

					// Route Selection
					if (res.questionId === this.dataService.question25) {
						this.routeRes = res.responseValue;
						if (res.responseValue === '[object Object]') {
							this.routeRes = '';
						}
						// if (this.routeRes === undefined || null) {
						// 	this.routeRes = res.responseValue;
						// }
						if (Object.keys(res.responseValue).length === 0) {
							this.routeRes = '';
							console.log('nothing selected for route!');
						}
					}

					// Experienced Rider
					if (res.questionId === this.dataService.question26) {
						this.experiencedRiderRes = res.responseValue;
						if (this.experiencedRiderRes === undefined || null) {
							this.experiencedRiderRes = res.responseValue;
						}
					}
				}
			});
	}

	// Update the Survey Responses
	updateSurveyRes() {

		const updateSurveyResponsesUrl = 'https://secure2.convio.net/cfrca/site/CRTeamraiserAPI?method=updateSurveyResponses&api_key=cfrca&v=1.0&response_format=json&fr_id='+ this.dataService.eventID + '&survey_id=' + this.dataService.surveyID;

		const question_attendence = '&question_'+ this.dataService.question1 +'=' + this.attendenceRes;
		const question_cancer = '&question_'+ this.dataService.question14 +'=' + this.cancerRes;
		const question_veg = '&question_'+ this.dataService.question11 +'=' + this.vegRes;
		const question_jersey = '&question_'+ this.dataService.question18 +'=' + this.jerseyRes;
		const question_shuttle1 = '&question_'+ this.dataService.question19 +'=' + this.shuttleRes;
		const question_shuttle2 = '&question_'+ this.dataService.question20 +'=' + this.shuttleRes2;
		const question_shuttle3 = '&question_'+ this.dataService.question21 +'=' + this.shuttleRes3;
		const question_shuttle4 = '&question_'+ this.dataService.question22 +'=' + this.shuttleRes4;
		const question_shuttle5 = '&question_'+ this.dataService.question23 +'=' + this.shuttleRes5;
		const question_route = '&question_'+ this.dataService.question25 +'=' + this.routeRes;
		const question_safety_rider = '&question_'+ this.dataService.question26 +'=' + this.experiencedRiderRes;

		this.http.post(updateSurveyResponsesUrl + question_attendence + question_cancer + question_veg + question_jersey + question_shuttle1 + question_shuttle2 + question_shuttle3 + question_shuttle4 + question_shuttle5 + question_route + question_safety_rider + '&sso_auth_token=' + this.dataService.ssoToken, null)
			.subscribe(res => {
				// console.log(res);
				this.updateReg();
				this.route.navigate(['/step-04']);
			},
			(error) => {
				console.log(error);
				this.route.navigate(['/step-01']);
			});
	}

	// Save Current Survey Answers (save for later)
	saveSurveyRes() {

		// Checking to see if data in the input is null or undefined, if so send as blank (to prevent errors in survey)
		if (this.dataService.emergencyName === null || undefined) {
			this.dataService.emergencyName = '';
		}

		if (this.dataService.emergencyPhone === null || undefined) {
			this.dataService.emergencyPhone = '';
		}

		if (this.routeRes === '[object Object]') {
			this.routeRes = '';
		}

		const updateSurveyResponsesUrl = 'https://secure2.convio.net/cfrca/site/CRTeamraiserAPI?method=updateSurveyResponses&api_key=cfrca&v=1.0&response_format=json&fr_id='+ this.dataService.eventID + '&survey_id=' + this.dataService.surveyID;

		const question_attendence = '&question_'+ this.dataService.question1 +'=' + this.attendenceRes;
		const question_cancer = '&question_'+ this.dataService.question14 +'=' + this.cancerRes;
		const question_veg = '&question_'+ this.dataService.question11 +'=' + this.vegRes;
		const question_jersey = '&question_'+ this.dataService.question18 +'=' + this.jerseyRes;
		const question_shuttle1 = '&question_'+ this.dataService.question19 +'=' + this.shuttleRes;
		const question_shuttle2 = '&question_'+ this.dataService.question20 +'=' + this.shuttleRes2;
		const question_shuttle3 = '&question_'+ this.dataService.question21 +'=' + this.shuttleRes3;
		const question_shuttle4 = '&question_'+ this.dataService.question22 +'=' + this.shuttleRes4;
		const question_shuttle5 = '&question_'+ this.dataService.question23 +'=' + this.shuttleRes5;
		const question_route = '&question_'+ this.dataService.question25 +'=' + this.routeRes;
		const question_safety_rider = '&question_'+ this.dataService.question26 +'=' + this.experiencedRiderRes;

		this.http.post(updateSurveyResponsesUrl + question_attendence + question_cancer + question_veg + question_jersey + question_shuttle1 + question_shuttle2 + question_shuttle3 + question_shuttle4 + question_shuttle5 + question_route + question_safety_rider + '&sso_auth_token=' + this.dataService.ssoToken, null)
			.subscribe(res => {
				console.log(res);
				// this.updateReg();
				this.snackBar.open("Your information has been saved!", "Close", {
                        duration: 3500,
                        extraClasses: ['saved-info']
                });
			},
			(error) => {
				console.log(error);
				this.snackBar.open("There was an error while saving your form!", "Close", {
                        duration: 3500,
                        extraClasses: ['error-info']
                });
				this.route.navigate(['/step-01']);
			});
	}

	// Update the Registration Information
	updateReg() {
		if (this.emergencyName === null || undefined) {
			this.emergencyName = '';
		}

		if (this.emergencyPhone === null || undefined) {
			this.emergencyPhone = '';
		}

		this.flowStep = '3';

		this.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.dataService.eventID + '&sso_auth_token=' + this.dataService.ssoToken + '&flow_step=' + this.flowStep + '&emergency_name=' + this.dataService.emergencyName + '&emergency_phone=' + this.dataService.emergencyPhone + '&response_format=json';
		this.http.post(this.dataService.convioURL + this.method, null)
			.subscribe(res => {
				this.snackBar.open("Your information has been saved!", "Close", {
                        duration: 3500,
                        extraClasses: ['saved-info']
                });
			}, (error) => {
				if (error) {
					this.snackBar.open("Sorry, there was an error, please try again.", "Close", {
                        duration: 3500,
                        extraClasses: ['error-info']
                	});
				}
			});
	}

	// Get the current Flowstep
	getFlowStep() {
		const token = localStorage.getItem('token');
		this.method = 'CRTeamraiserAPI?method=getFlowStep&api_key=cfrca&v=1.0&response_format=json&fr_id='+ this.dataService.eventID + '&sso_auth_token='+ token;
		this.http.post(this.dataService.convioURL + this.method, null)
			.subscribe(res => {
				this.flowStepResults = res;
				this.getFlowStepNumber = this.flowStepResults.getFlowStepResponse.flowStep;

				// Checking the participants flow step to prevent user from skipping a flowstep
				if (this.getFlowStepNumber === this.flowStep) {
					// If the flow step matches to where they are supposed to be, then run the functions for the page below
					this.getSurveyRes();
					this.dataService.getRegInfo();
				} else {
					// If flowstep does not match, show error message and kick them back to the previous page/flowstep.
					this.snackBar.open("Please don't try to skip pages.", "Close", {
                        duration: 3500,
                        extraClasses: ['error-info']
               		});
					this.previous();
				}

			}, (err) => {
				console.log(err);
				this.snackBar.open("There was an error, please login again.", "Close", {
                    duration: 3500,
                    extraClasses: ['error-info']
           		});
				this.dataService.logOut();
			});
	}

	// Update the current Flowstep
	previousFlowStep() {
		this.flowStep = '1';
		this.dataService.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.dataService.eventID + '&sso_auth_token=' + this.dataService.ssoToken + '&flow_step=' + this.flowStep + '&response_format=json';
		this.http.post(this.dataService.convioURL + this.dataService.method, null)
			.subscribe(res => {
				// console.log('Flow step updated.')
				this.previous();
			}, (err) => {
				if (err) {
					// console.log('There was an error updating the flowstep.');
					this.snackBar.open("There was an unknown error.", "Close", {
	                    duration: 3500,
	                    extraClasses: ['error-info']
	               	});
					this.dataService.logOut();
				}
			});
	}

	// Go to previous route
	previous() {
		this.route.navigate(['/step-02'])
	}

}
