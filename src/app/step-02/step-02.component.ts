import { Component, OnInit, Inject } from '@angular/core';

/* FormGroup and Validators */
import { FormGroup, FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';

/* Router */
import { Router } from '@angular/router';

/* HTTP Client */
import { HttpClient, HttpRequest, HttpEvent, HttpEventType } from '@angular/common/http';

/* Angular Material Compnents */
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSnackBar, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

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
  selector: 'app-step-02',
  templateUrl: './step-02.component.html',
  styleUrls: ['./step-02.component.scss']
})
export class Step02Component implements OnInit {

	step02Form: FormGroup;

	matcher = new MyErrorStateMatcher();

	// Variables
	updateRegRes:any={};
	flowStep:string='1';
	method:string;
	checkInStatus:string = 'started';

	firstName:string;
	lastName:string;
	primaryAddress1:string;
	primaryAddress2:string;
	primaryCity:string;
	primaryState:string;
	primaryZip:string;
	gender:string;


	// Gender select
	matSelect = [
		{value: 'MALE', viewValue: 'Male'},
	    {value: 'FEMALE', viewValue: 'Female'},
	]

	// Setting a variable for getSurvey's response as any Object
	surveyRes:any = {};

	// Setting a variable for getUserInfo()'s response as any Object
	consData:any = {};

	updateUserResults:any = {};

	// Setting a variable to retrieve the constituent ID stored in the storageConsID (which is connected to localStorage)
	localConsID:any = this.dataService.storageConsID;

  constructor (private dataService: DataService,
               private router: Router,
               private http: HttpClient,
               public snackBar: MatSnackBar,
               public dialog: MatDialog) {

    if (this.primaryAddress2 === null) {
      this.primaryAddress2 = '';
    }
  }

	ngOnInit() {

		window.scrollTo(0,0);

		// console.log('From Step 02 - CONS ID:' + this.localConsID);
		// Checking logged in state, if they are logged in run regInfo() and getUserInfo() functions from the global dataService.
		if (this.dataService.isLoggedIn() === true && this.dataService.tokenExpired === false) {
			// console.log('You are logged in!');

      // Open welcome dialog / modal if logged in and in correct route
      if (this.router.url === '/step-02'){
        this.openDialog();
      }

			this.getRegInfo();
			this.getUserInfo();

			this.updateCheckInStatus();
			this.updateFlowStep();

		} else if (this.dataService.storageToken === undefined) {
			// console.log('Auth Token Expired.');
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

		if (this.consData.getConsResponse) {

			if (this.firstName === undefined || null) {
				this.firstName = this.consData.getConsResponse.name.first;
			}

			if (this.lastName === undefined || null) {
				this.lastName = this.consData.getConsResponse.name.last;
			}

			if (this.primaryAddress1 === undefined || null) {
				this.primaryAddress1 = this.consData.getConsResponse.primary_address.street1;
			}

			if (this.primaryAddress2 === undefined || null) {
				this.primaryAddress2 = this.consData.getConsResponse.primary_address.street2;
			}

		}

		this.step02Form = new FormGroup({
			firstName: new FormControl(this.firstName, Validators.required),
			lastName: new FormControl(this.lastName, Validators.required),
			liveAddress1: new FormControl(this.primaryAddress1, Validators.required),
			liveAddress2: new FormControl(this.primaryAddress2),
			liveCity: new FormControl(this.primaryCity, Validators.required),
			liveState: new FormControl(this.primaryState, Validators.required),
			liveZip: new FormControl(this.primaryZip, Validators.required),
			genderSelect: new FormControl(this.gender, Validators.required)
		});

	}

	// For calls after the view has been initialized
	ngAfterViewInit() {}

	// Update the checkInStatus from Registration
	updateCheckInStatus() {
		this.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.dataService.eventID + '&sso_auth_token=' + this.dataService.ssoToken + '&checkin_status=' + this.checkInStatus + '&response_format=json';
		this.http.post(this.dataService.convioURL + this.method, null)
			.subscribe(res => {
				this.updateRegRes = res;
			});
	}

	// Gather Registration Information
	getRegInfo() {
		this.dataService.storageToken = localStorage.getItem('token');
		this.method = 'CRTeamraiserAPI?method=getRegistration&api_key=cfrca&v=1.0&response_format=json&fr_id='+ this.dataService.eventID + '&sso_auth_token='+ this.dataService.storageToken;
		this.http.post(this.dataService.convioURL + this.method, null)
			.subscribe(res => {
				this.dataService.regResponse = res;
				// console.log(this.dataService.regResponse);

				// Setting the participation ID Variables
				this.dataService.participationID = this.dataService.regResponse.getRegistrationResponse.registration.participationTypeId;
				localStorage.setItem('participationID', this.dataService.participationID);
				this.dataService.storageParticipationID = localStorage.getItem('participationID');

				// Setting the Emergency Name and Number Variables
				this.dataService.emergencyName = this.dataService.regResponse.getRegistrationResponse.registration.emergencyName;
				this.dataService.emergencyPhone = this.dataService.regResponse.getRegistrationResponse.registration.emergencyPhone;

				this.dataService.getParticipationType();

				// If participant is in a team, get the team information
				if (this.dataService.regResponse.getRegistrationResponse.registration.teamId > 0) {
					this.dataService.getTeam();
				}
			}, (err) => {
				console.log(err);
				this.dataService.tokenExpired = true;
				this.router.navigate(['/step-01']);
			});
	}

	// Gather Constituent Information
	getUserInfo() {
		this.dataService.storageToken = localStorage.getItem('token');
		this.method = 'CRConsAPI?method=getUser&api_key=cfrca&v=1.0&response_format=json&cons_id='+ this.dataService.storageConsID + '&sso_auth_token='+ this.dataService.storageToken;
		this.http.post(this.dataService.convioURL + this.method, null)
			.subscribe(res => {
				this.consData = res;
				// console.log(this.consData);

				// console.log(this.dataService.getConsInfo);
				this.firstName = this.consData.getConsResponse.name.first;
				this.lastName = this.consData.getConsResponse.name.last;
				this.primaryAddress1 = this.consData.getConsResponse.primary_address.street1;
				this.primaryAddress2 = this.consData.getConsResponse.primary_address.street2;
				this.primaryCity = this.consData.getConsResponse.primary_address.city;
				this.primaryState = this.consData.getConsResponse.primary_address.state;
				this.primaryZip = this.consData.getConsResponse.primary_address.zip;

				this.dataService.consUserName = this.consData.getConsResponse.user_name;

				this.gender = this.consData.getConsResponse.gender;

			}, (err) => {
				console.log('There was an error getting the Cons Info:')
				console.log(err);
			});
	}

	// Update Constituent Information
	updateUser() {

		if (this.primaryAddress2 === null) {
			this.primaryAddress2 = '';
		}

		const consUrl = '&cons_id='+ this.dataService.storageConsID;
		const ssoUrl = '&sso_auth_token='+ this.dataService.storageToken;
		var firstNameUrl = '&name.first=' + this.firstName;
		var lastNameUrl = '&name.last=' + this.lastName;
		var address1Url = '&primary_address.street1=' + this.primaryAddress1;
		var address2Url = '&primary_address.street2=' + this.primaryAddress2;
		var cityUrl = '&primary_address.city=' + this.primaryCity;
		var stateUrl = '&primary_address.state=' + this.primaryState;
		var zipUrl = '&primary_address.zip=' + this.primaryZip;
		const genderUrl = '&gender=' + this.gender;

		this.method = 'CRConsAPI?method=update&api_key=cfrca&v=1.0&response_format=json'+ consUrl + ssoUrl + firstNameUrl + lastNameUrl + genderUrl + address1Url + address2Url + cityUrl + stateUrl + zipUrl;
		this.http.post(this.dataService.convioURL + this.method, null)
			.subscribe(res => {
				this.updateUserResults = res;

				this.updateFlowStepNext();
				// this.router.navigate(['/step-03']);
			}, (err) => {
				console.log('There was an error getting the Participation Info:')
				console.log(err);
			});
	}

	// Save Constituent Information
	updateUserSave() {

		if (this.primaryAddress2 === null) {
			this.primaryAddress2 = '';
		}

		const consUrl = '&cons_id='+ this.dataService.storageConsID;
		const ssoUrl = '&sso_auth_token='+ this.dataService.storageToken;
		const firstNameUrl = '&name.first=' + this.firstName;
		const lastNameUrl = '&name.last=' + this.lastName;
		const address1Url = '&primary_address.street1=' + this.primaryAddress1;
		const address2Url = '&primary_address.street2=' + this.primaryAddress2;
		const cityUrl = '&primary_address.city=' + this.primaryCity;
		const stateUrl = '&primary_address.state=' + this.primaryState;
		const zipUrl = '&primary_address.zip=' + this.primaryZip;
		const genderUrl = '&gender=' + this.gender;

		this.method = 'CRConsAPI?method=update&api_key=cfrca&v=1.0&response_format=json'+ consUrl + ssoUrl + firstNameUrl + lastNameUrl + genderUrl + address1Url + address2Url + cityUrl + stateUrl + zipUrl;
		this.http.post(this.dataService.convioURL + this.method, null)
			.subscribe(res => {
				this.updateUserResults = res;
				// console.log(this.updateUserResults);
				this.snackBar.open("Your information has been saved!", "Close", {
                        duration: 3500,
                        extraClasses: ['saved-info']
                });
			}, (err) => {
				this.snackBar.open("There was an error while trying to save. Please check the form.", "Close", {
                        duration: 3500,
                        extraClasses: ['error-info']
                });
			});
	}

	// Check Logged In State
	isLoggedIn() {
		return this.dataService.isLoggedIn();
	}

	// Update the Flow Step
	updateFlowStep() {
		this.dataService.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.dataService.eventID + '&sso_auth_token=' + this.dataService.ssoToken + '&flow_step=' + this.flowStep + '&response_format=json';
		this.http.post(this.dataService.convioURL + this.dataService.method, null)
			.subscribe(res => {
				this.updateRegRes = res;
			});
	}

	updateFlowStepNext() {
		this.dataService.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.dataService.eventID + '&sso_auth_token=' + this.dataService.storageToken + '&flow_step=2' + '&response_format=json';
		this.http.post(this.dataService.convioURL + this.dataService.method, null)
			.subscribe(res => {
				this.updateRegRes = res;
				this.router.navigate(['/step-03']);
			});
	}

  openDialog() {
    this.dialog.open(Step02Dialog, {
      width: '600px'
    });
  }
}

@Component({
  selector: 'step-02-dialog',
  templateUrl: './step-02.dialog.html',
  styleUrls: ['./step-02.component.scss']
})
export class Step02Dialog {
  firstName: string;
  constructor
  (@Inject(MAT_DIALOG_DATA)
   public data: any,
   public dialogRef: MatDialogRef<Step02Dialog>,
   private dataService: DataService) {
    dataService.getUserInfo();
    this.firstName = dataService.firstName;
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
}
