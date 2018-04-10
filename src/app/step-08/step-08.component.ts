import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';

/* HTTP Client to retrieve data */
import { HttpClient, HttpRequest, HttpEvent, HttpEventType } from '@angular/common/http';

/* Data Service */
import { DataService } from '../data.service';

/* Angular Material */
import { MatSnackBar } from '@angular/material';

/* Form Validation */
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-step-08',
  templateUrl: './step-08.component.html',
  styleUrls: ['./step-08.component.scss']
})
export class Step08Component implements OnInit {

	// Email Input Validation
	emailFormControl = new FormControl('', Validators.email);

	// Message Variable
	@ViewChild('message') message:ElementRef;

	// Setting the FlowStep
	flowStep:string = '7';
	flowStepResults:any={};
	getFlowStepNumber:string;

	// getRegInfo Data
	regResponse:any={};

	// getTentingSearch Results
	tentingResults:any={};

	// Tenting Search Input Variables
	searchEmail:string;
	searchFirstName:string;
	searchLastName:string;
	tentConsID:string;
	tentStatus:string;
	tentMessage:string;

	// Tenting Results Variables
	searchName:string;
	searchStatus:string;

	// Tenting Status Variables
	tentingStatus:any={};

	// Boolean for Searching Tent Mate
	searchTent:boolean=false;

	// Tent Status Selected Variable
	statusSelected:boolean=false;

	// Cons ID
	consID:string;

	// Toggle for the Next Button
	nextToggle:boolean=true;

	// Tentstatus
	tentmateStatus:boolean=false;

	constructor(private data: DataService, private router: Router, private http: HttpClient, private renderer: Renderer2, public snackBar: MatSnackBar) { }

	ngOnInit() {

		// Checking logged in state, and running correct functions
		if (this.data.isLoggedIn() === true && this.data.tokenExpired === false) {
			
			// If logged in state is correct, run functions
			this.getFlowStep();
		} else if (this.data.storageToken === undefined) {
			this.snackBar.open("Login session expired, please login again.", "Close", {
                duration: 3500,
                extraClasses: ['error-info']
            });
			this.router.navigate(['/step-01']);

		} else {
			// if not logged in, go back to step 1 (login page)
			this.snackBar.open("You are not logged in, please login.", "Close", {
                duration: 3500,
                extraClasses: ['error-info']
            });
			this.router.navigate(['/step-01']);
		}
	}

	// Gather Registration Information
	getRegInfo() {
		this.data.storageToken = localStorage.getItem('token');
		this.data.method = 'CRTeamraiserAPI?method=getRegistration&api_key=cfrca&v=1.0&response_format=json&fr_id='+ this.data.eventID + '&sso_auth_token='+ this.data.storageToken;
		this.http.post(this.data.convioURL + this.data.method, null)
			.subscribe(res => {
				this.regResponse = res;

				console.log(this.regResponse);

				this.consID = this.regResponse.getRegistrationResponse.registration.consId;
				
				if (this.regResponse.getRegistrationResponse.registration.tentingAllowed === 'true') {
					// this.getTentingSearch();
				} else {
					// console.log('Tenting is NOT allowed for this event, route them to summary.');
					
					// Route participant to the summary page using router navigate
					this.nextFlowStep();
				}

				if (this.regResponse.getRegistrationResponse.registration.tentmateStatus === '2' || this.regResponse.getRegistrationResponse.registration.tentmateStatus === '3' || this.regResponse.getRegistrationResponse.registration.tentmateStatus === '4') {
					this.tentmateStatus = true;
				}

			}, (err) => {
				// console.log('There was an error getting the Registration info:')
				console.log(err);
				this.data.tokenExpired = true;
				this.snackBar.open("Your login session has expired, please login again.", "Close", {
                        duration: 13500,
                        extraClasses: ['error-info']
               		});
				this.router.navigate(['/step-01']);
			});
	}

	// Search for a Tentmate (based on filters)
	getTentingSearch() {

		// Checking tentmate message value and setting the message to the proper variable
		if (this.message.nativeElement.value.length != 0) {
			this.tentMessage = this.message.nativeElement.value;

			// console.log(this.tentMessage);
		}

		// Filters for searching for a tentmate
		const searchEmail = '&search_email=' + this.searchEmail;
		const searchFirstName = '&search_first_name=' + this.searchFirstName;
		const searchLastName = '&search_last_name=' + this.searchLastName;

		// API Method to retrieve proper data
		this.data.method = 'CRTeamraiserAPI?method=getTentingSearch&api_key=cfrca&v=1.0&response_format=json&fr_id='+ this.data.eventID + '&sso_auth_token=' + this.data.ssoToken;

		if (this.searchLastName != undefined && this.searchLastName != '') {
			
			this.data.method += searchLastName;
			
			// console.log('Searching by Last name: ' + this.searchLastName);
		} else if (this.searchFirstName != undefined && this.searchFirstName != '') {
			
			this.data.method += searchFirstName;
			
			// console.log('Searching by First name: ' + this.searchFirstName);
		} else if (this.searchEmail != undefined && this.searchEmail != '') {
			
			this.data.method += searchEmail;
			
			// console.log('Searching by Email: ' + this.searchEmail);
		} else {
			this.data.method = 'CRTeamraiserAPI?method=getTentingSearch&api_key=cfrca&v=1.0&response_format=json&fr_id='+ this.data.eventID + '&sso_auth_token=' + this.data.ssoToken;
		}

		this.http.post(this.data.convioURL + this.data.method, null)
			.subscribe(res => {
				this.tentingResults = res;
				// console.log(this.tentingResults);

			}, (err) => {
				if (err) {
					console.log('There was an error while searching for tentmate.');
				}
			});
	}

	// Update the Tenting Status
	updateTentingStatus() {
		// API Method to updateTentingStatus
		this.data.method = 'CRTeamraiserAPI?method=updateTentingStatus&api_key=cfrca&v=1.0&response_format=json&tentmate_id='+ this.tentConsID +'&update_type='+ this.tentStatus +'&fr_id=' + this.data.eventID + '&sso_auth_token=' + this.data.ssoToken;

		if (this.message) {
			if (this.message.nativeElement.value != '') {
				this.tentMessage = this.message.nativeElement.value;

				this.data.method = 'CRTeamraiserAPI?method=updateTentingStatus&api_key=cfrca&v=1.0&response_format=json&tentmate_id='+ this.tentConsID +'&update_type='+ this.tentStatus + '&message='+ this.tentMessage +'&fr_id='+ this.data.eventID +'&sso_auth_token=' + this.data.ssoToken;
			}
		}
		
		this.http.post(this.data.convioURL + this.data.method, null)
			.subscribe(res => {
				this.tentingResults = res;
				console.log(this.tentingResults);
			},(err) => {
				if (err) {
					console.log('There was an error updating the tent status.');
				}
			});
	}

	// Function for (Select a Tentmate for Me)  ***(&tentmate_id=) Must be blank for this to work properly***
	randomTentingStatus() {
		// this.statusSelected = true;
		this.tentStatus = 'random';

		// API Method to updateTentingStatus
		this.data.method = 'CRTeamraiserAPI?method=updateTentingStatus&api_key=cfrca&v=1.0&response_format=json' + '&fr_id=' + this.data.eventID + '&sso_auth_token=' + this.data.ssoToken + '&tentmate_id=' + '&update_type=' + this.tentStatus;

		this.http.post(this.data.convioURL + this.data.method, null)
			.subscribe(res => {
				// this.tentingResults = res;
				// console.log(this.tentingResults);

				this.snackBar.open("A random tentmate has been selected for you.", "Close", {
                        duration: 3500,
                        extraClasses: ['saved-info']
                });

				this.nextFlowStep();
			},(err) => {
				if (err) {
					console.log('There was an error updating the tent status.');
					this.snackBar.open("There was an error while trying to set your tentmate status.", "Close", {
                        duration: 13500,
                        extraClasses: ['error-info']
               		});
				}
			});
	}

	// Function for (I don't need a tent) ***(&tentmate_id=) Must be blank for this to work properly ***
	declineTent() {
		// this.statusSelected = true;
		this.tentStatus = 'decline';

		// API Method to updateTentingStatus
		this.data.method = 'CRTeamraiserAPI?method=updateTentingStatus&api_key=cfrca&v=1.0&response_format=json' + '&fr_id=' + this.data.eventID + '&sso_auth_token=' + this.data.ssoToken + '&tentmate_id=' + '&update_type=' + this.tentStatus;
		this.http.post(this.data.convioURL + this.data.method, null)
			.subscribe(res => {
				// this.tentingResults = res;
				// console.log(this.tentingResults);

				this.snackBar.open("You have selected to decline tentmate.", "Close", {
                        duration: 3500,
                        extraClasses: ['saved-info']
                });
                
                this.nextFlowStep();
			},(err) => {
				if (err) {
					console.log(err);
					this.snackBar.open("There was an error while trying to set your tentmate status.", "Close", {
                        duration: 13500,
                        extraClasses: ['error-info']
               		});
				}
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

	// Send Tenting Invite
	invite(consID) {

		this.tentStatus = 'invite';

		// API Method to updateTentingStatus
		this.data.method = 'CRTeamraiserAPI?method=updateTentingStatus&api_key=cfrca&v=1.0&response_format=json&tentmate_id='+ consID +'&update_type='+ this.tentStatus +'&fr_id=' + this.data.eventID + '&sso_auth_token=' + this.data.ssoToken;
		this.http.post(this.data.convioURL + this.data.method, null)
			.subscribe(res => {
				this.tentingResults = res;
				// console.log(this.tentingResults);
				this.nextToggle = false;

				this.snackBar.open("Tentmate invite successful!", "Close", {
                        duration: 3500,
                        extraClasses: ['saved-info']
                });
            	window.location.reload();
			},(err) => {
				if (err) {
					this.snackBar.open("There was an error. (You may have already sent an invite to someone else)", "Close", {
                        duration: 13500,
                        extraClasses: ['error-info']
               		});
				}
			});
	}

	// Update the flowStep to the next flowStep once everything checks out
	nextFlowStep() {
		this.flowStep = '8';
		this.data.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.data.eventID + '&sso_auth_token=' + this.data.ssoToken + '&flow_step=' + this.flowStep + '&response_format=json';
		this.http.post(this.data.convioURL + this.data.method, null) 
			.subscribe(res => {
				// Update the flowStep to the next flowstep once everything checks out properly
				this.router.navigate(['/step-09']);
			}, (err) => {
				if (err) {
					console.log(err);
					this.data.logOut();
				}
			});
	}

	// Update the current Flowstep
	previousFlowStep() {
		this.flowStep = '6';
		this.data.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.data.eventID + '&sso_auth_token=' + this.data.ssoToken + '&flow_step=' + this.flowStep + '&response_format=json';
		this.http.post(this.data.convioURL + this.data.method, null) 
			.subscribe(res => {

				// Route user to previous flow step
				this.router.navigate(['/step-07']);
			}, (err) => {
				if (err) {
					console.log(err);
					this.data.logOut();
				}
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
					this.getRegInfo();
					this.updateFlowStep();
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

}
