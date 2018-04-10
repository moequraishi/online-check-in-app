import { HttpClient, HttpRequest } from '@angular/common/http';

import { MatSnackBar } from '@angular/material';

import { Router } from '@angular/router';

import { Injectable } from '@angular/core';

@Injectable()
export class DataService {

	/* ============  Global Variables Below ============*/

	// Event ID
	eventID:any = '1641';

	// Survey ID
	surveyID:any = '82857';

	// Survey Question ID(s) - below insert the Survey Question IDs
	question1:string = '86997'; // How many years have you ridden with The Ride?
	question2:string = '86998'; // Waiver and Release Full Name
	question3:string = '86999'; // 18 Years Check Box

	question4:string = '87000'; // Health Insurance Company name
	question5:string = '87001'; // Health Insurance Policy Number

	question6:string = '87002'; // Accepted Upsell Offer
	question7:string = '87003'; // Donation Form Type
	question8:string = '87004'; // DSP Save Value

	question9:string = '87005'; // Citizenship
	question10:string = '87006'; // Passport #

	question11:string = '87007'; // Birth Month
	question12:string = '87008'; // Birth Day
	question13:string = '87009'; // Birth Year

	question14:string = '87010'; // Want to be recognized as a cancer survivor?
	question15:string = '87011'; // Vegetarian meal

	question16:string = '87012'; // Hidden Upsell Value
	question17:string = '87013'; // Hidden Safety Video Watched

	question18:string = '87014'; // Jersey Size

	question19:string = '87015'; // Shuttle Question 1
	question20:string = '87016'; // Shuttle Question 2
	question21:string = '87017'; // Shuttle Question 3
	question22:string = '87018'; // Shuttle Question 4
	question23:string = '87019'; // Shuttle Question 5

	question24:string = '87020'; // Bike Transport

	// Extra Survey Questions
	question25:string = '87021'; // Route Number
	question26:string = '87022'; // Safety Rider

	// Upsell IDs
	hiddenUpsellID:string = '1441'; // Upsell ID #1 copied from Teamraiser
	hiddenUpsellID2:string = '1443'; // Upsell ID #2 copied from Teamraiser

  // Safety Video
  safetyVidURL:string = 'assets/videos/oci_sample_vid.mp4';

	// Login Information
 	username:string;
	password:string;

	loginErr:boolean;

	// API Call Information (change per region)
	convioURL:string = 'https://secure2.convio.net/cfrca/site/';
	loginMethod:string;
	method:string;

	// Setting logged in state (must be false initially)
	isloggedIn:any = false;

	// Registration Variables
	regResponse:any = {};

	// Setting flow step state
	flowStepResults:any = {};
	flowStep:any;

	// Results from API Call
	loginRes:any = {};
	isloggedInRes:any = {};

	// Results from getSurveyRes
	surveyResults:any = {};

	// Results from getReg
	regRes:any = {};

	// Results from updateReg
	updateRegRes:any = {};

	// Sign-on Token
	ssoToken:any = localStorage.getItem('token');
	storageToken:string;
	tokenExpired:boolean;

	// Constituent Information
	consID:any;
	storageConsID:any;
	getConsInfo:any;

	consUserName:string;
	firstName:string;
	lastName:string;
	primaryAddress1:string;
	primaryAddress2:string;
	primaryCity:string;
	primaryState:string;
	primaryZip:string;
	gender:string;

	emergencyName:string;
	emergencyPhone:string;

	localFirstName:string;
	localLastName:string;
	localGender:string;

	// Update Cons Result
	updateUserResults:Object;

	// Elements retrieved from the DOM
	liveFirstName:string;
	liveLastName:string;
	liveAddress1:string;
	liveAddress2:string = '';
	liveCity:string;
	liveState:string;
	liveZip:string;

	liveEmergencyName:string;
	liveEmergencyPhone:string;

	genderSelect:string;

	// Participation Type
	participationID:string;
	storageParticipationID:string;
	participationRes:any;
	participationType:string;

	// Team
	getTeamRes:any = {};
	teamName:string;

	// Survey Fields
	cancerRes:string;
	vegRes:string;

	show:boolean = true;

	// Tentmate Status Variable
	tentStatus:string;

 	constructor(private http: HttpClient, private router: Router, public snackBar: MatSnackBar) {

 		if (localStorage.getItem('token') !== undefined || null) {
			this.tokenExpired = false;
		}

 		// If user's logged in state returns true set login state, and add constiuent ID from the the local storage into a global variable
 		if (this.isLoggedIn() === true) {
 			this.isloggedIn = true;
 			this.storageConsID = localStorage.getItem('consID');
 			this.storageParticipationID = localStorage.getItem('participationID');
 		}

 	}

	// Retrieve a Survey based on Survey ID and Auth Token
 	getSurvey() {
 		const token = localStorage.getItem('token');
 		this.convioURL = 'https://secure2.convio.net/cfrca/site/';
 		this.method = 'CRSurveyAPI?method=getSurvey&api_key=cfrca&v=1.0&response_format=json&survey_id='+ this.surveyID +'&sso_auth_token='+ token;
   		this.http.post(this.convioURL + this.method, null)
   			.subscribe(data => {
   				this.surveyResults = data;
   			},
   			(error) => {
   				if (error) {
   					console.log('There was an error while getting the survey data.')
   				}
   			});
	}

	// Log out, clear out the local storage, forcing user to log in again
	logOut() {
		localStorage.clear();
		this.router.navigate(['/step-01']);
		// window.location.reload();
		this.snackBar.open("You are now logged out.", "Close", {
                duration: 3500,
                extraClasses: ['error-info']
        });
	}

	// Check logged in state by a token retrieved by login into the app
	isLoggedIn() {
		return localStorage.getItem('token') !== null;
	}

	// Log into the OCI Web App
	logMeIn() {
		this.convioURL = 'https://secure2.convio.net/cfrca/site/';
 		this.loginMethod = 'CRConsAPI?method=login&api_key=cfrca&v=1.0&user_name='+ this.username +'&password='+ this.password +'&response_format=json';
	    this.http.post(this.convioURL + this.loginMethod, null)
			.subscribe(res => {
				this.loginRes = res;
				// console.log(this.loginRes);
				this.ssoToken = this.loginRes.loginResponse.token;
				this.consID = this.loginRes.loginResponse.cons_id;
				localStorage.setItem('consID', this.consID);

				this.storageConsID = localStorage.getItem('consID');
				// console.log(this.consID);

				localStorage.setItem('token', this.ssoToken);
				this.tokenExpired = false;

				this.storageToken = localStorage.getItem('token');

				// Get flow step
				this.getFlowStepLogin();
			}, (err) => {
				// console.log(err);
				this.loginErr = true;

				this.snackBar.open("Error with username or password.", "Close", {
                        duration: 3500,
                        extraClasses: ['error-info']
                });
			});
	}

	// Get the current Flowstep and Send them to the route
	getFlowStepLogin() {
		const token = localStorage.getItem('token');
		this.method = 'CRTeamraiserAPI?method=getFlowStep&api_key=cfrca&v=1.0&response_format=json&fr_id='+ this.eventID + '&sso_auth_token='+ this.ssoToken;
		this.http.post(this.convioURL + this.method, null)
			.subscribe(res => {
				this.flowStepResults = res;
				this.flowStep = this.flowStepResults.getFlowStepResponse.flowStep;

				// Check the Flowstep, if matched, send them to the proper route
				if (this.flowStep === '0') {
					this.router.navigate(['/step-02']);
				}
				if (this.flowStep === '1') {
					this.router.navigate(['/step-02']);
				}
				if (this.flowStep === '2') {
					this.router.navigate(['/step-03']);
				}
				if (this.flowStep === '3') {
					this.router.navigate(['/step-04']);
				}
				if (this.flowStep === '4') {
					this.router.navigate(['/step-05']);
				}
				if (this.flowStep === '5') {
					this.router.navigate(['/step-06']);
				}
				if (this.flowStep === '6') {
					this.router.navigate(['/step-07']);
				}
				if (this.flowStep === '7') {
					this.router.navigate(['/step-08']);
				}
				if (this.flowStep === '8') {
					this.router.navigate(['/step-09']);
				}
			}, (err) => {
				// console.log(err);

				// If user tries to login with credentials from a different event display error message
				if (err.error.errorResponse.code === '2603') {
					localStorage.removeItem('token');
					this.snackBar.open("The username / password combination is incorrect for this event.", "Close", {
	                        duration: 3500,
	                        extraClasses: ['error-info']
	                });
				}
			});
	}

	// Get the current Flowstep
	getFlowStep() {
 	  const token = localStorage.getItem('token');
 	  this.method = 'CRTeamraiserAPI?method=getFlowStep&api_key=cfrca&v=1.0&response_format=json&fr_id='+ this.eventID + '&sso_auth_token='+ this.ssoToken;
 	    this.http.post(this.convioURL + this.method, null)
      .subscribe(res => {
        this.flowStepResults = res;
			this.flowStep = parseInt(this.flowStepResults.getFlowStepResponse.flowStep);
			}, (err) => {
        console.log(err);
      });
 	}

	// Update the current Flowstep
	updateFlowStep() {
		this.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.eventID + '&sso_auth_token=' + this.ssoToken + '&flow_step=' + this.flowStep + '&response_format=json';
		this.http.post(this.convioURL + this.method, null)
			.subscribe(res => {
				this.updateRegRes = res;
			}, (err) => {
				console.log(err);
			});
	}

	// Gather Registration Information
	getRegInfo() {
		this.storageToken = localStorage.getItem('token');
		this.method = 'CRTeamraiserAPI?method=getRegistration&api_key=cfrca&v=1.0&response_format=json&fr_id='+ this.eventID + '&sso_auth_token='+ this.storageToken;
		this.http.post(this.convioURL + this.method, null)
			.subscribe(res => {
				// Results from the API Call
				this.regResponse = res;

				this.participationID = this.regResponse.getRegistrationResponse.registration.participationTypeId;
				localStorage.setItem('participationID', this.participationID);
				this.storageParticipationID = localStorage.getItem('participationID');

				// console.log('Storage Participation ID: ' + this.storageParticipationID);
				// console.log('Login Participation ID: ' + this.participationID);
				// console.log(this.regResponse);

				this.emergencyName = this.regResponse.getRegistrationResponse.registration.emergencyName;
				this.emergencyPhone = this.regResponse.getRegistrationResponse.registration.emergencyPhone;

				if (this.regResponse.getRegistrationResponse.registration.tentmateStatus === '1') {
					this.tentStatus = 'Eligible';
				} else if (this.regResponse.getRegistrationResponse.registration.tentmateStatus === '2') {
					this.tentStatus = 'Declined';
				} else if (this.regResponse.getRegistrationResponse.registration.tentmateStatus === '3') {
					this.tentStatus = 'Random';
				} else if (this.regResponse.getRegistrationResponse.registration.tentmateStatus === '4') {
					this.tentStatus = 'Sent Invite';
				} else if (this.regResponse.getRegistrationResponse.registration.tentmateStatus === '0') {
					this.tentStatus = 'None';
				}

				this.getParticipationType();
			}, (err) => {
				console.log('There was an error getting the Registration:')
				console.log(err);
				this.tokenExpired = true;
				this.router.navigate(['/step-01']);
			});
	}

	// Gather Constituent Information
	getUserInfo() {
		this.storageToken = localStorage.getItem('token');
		this.method = 'CRConsAPI?method=getUser&api_key=cfrca&v=1.0&response_format=json&cons_id='+ this.storageConsID + '&sso_auth_token='+ this.storageToken;
		this.http.post(this.convioURL + this.method, null)
			.subscribe(res => {
				this.getConsInfo = res;
				// console.log(this.getConsInfo);
				this.firstName = this.getConsInfo.getConsResponse.name.first;
				this.lastName = this.getConsInfo.getConsResponse.name.last;
				this.primaryAddress1 = this.getConsInfo.getConsResponse.primary_address.street1;
				this.primaryAddress2 = this.getConsInfo.getConsResponse.primary_address.street2;
				this.primaryCity = this.getConsInfo.getConsResponse.primary_address.city;
				this.primaryState = this.getConsInfo.getConsResponse.primary_address.state;
				this.primaryZip = this.getConsInfo.getConsResponse.primary_address.zip;

				this.consUserName = this.getConsInfo.getConsResponse.user_name;

				this.gender = this.getConsInfo.getConsResponse.gender;
			}, (err) => {
				console.log(err);
			});
	}

	// Gather Participation Type
	getParticipationType() {
		this.method = 'CRTeamraiserAPI?method=getParticipationType&api_key=cfrca&v=1.0&response_format=json&fr_id='+ this.eventID + '&participation_type_id=' + this.storageParticipationID;

		this.http.post(this.convioURL + this.method, null)
		.subscribe(res => {
			this.participationRes = res;
			// console.log(this.participationRes);
			this.participationType = this.participationRes.getParticipationTypeResponse.participationType.name;
			// localStorage.setItem('participationType', this.participationType);
		}, (err) => {
			console.log(err);
		});
	}

	// Update User Information
	updateUser() {
		const consUrl = '&cons_id='+ this.storageConsID;
		const ssoUrl = '&sso_auth_token='+ this.storageToken;
		var firstNameUrl = '&name.first=' + this.liveFirstName;
		var lastNameUrl = '&name.last=' + this.liveLastName;
		var address1Url = '&primary_address.street1=' + this.liveAddress1;
		var address2Url = '&primary_address.street2=' + this.liveAddress2;
		var cityUrl = '&primary_address.city=' + this.liveCity;
		var stateUrl = '&primary_address.state=' + this.liveState;
		var zipUrl = '&primary_address.zip=' + this.liveZip;
		const genderUrl = '&gender=' + this.genderSelect;

		// Checking if input data is undefined if so set it as what it previously was (to prevent data getting saved as undefined)
		if (this.liveFirstName === undefined) {
			var firstNameUrl = '&name.first=' + this.firstName;
		}
		if (this.liveLastName === undefined) {
			var lastNameUrl = '&name.first=' + this.lastName;
		}
		if (this.liveAddress1 === undefined) {
			var address1Url = '&primary_address.street1=' + this.primaryAddress1;
		}
		if (this.liveAddress2 === undefined) {
			var address2Url = '&primary_address.street2=' + this.primaryAddress2;
		}
		if (this.primaryAddress2 || this.liveAddress2  === null) {
			this.primaryAddress2 = '';
			this.liveAddress2 = '';
		}
		if (this.liveCity === undefined) {
			var cityUrl = '&primary_address.city=' + this.primaryCity;
		}
		if (this.liveState === undefined) {
			var stateUrl = '&primary_address.city=' + this.primaryState;
		}
		if (this.liveZip === undefined) {
			var zipUrl = '&primary_address.zip=' + this.primaryZip;
		}
		this.method = 'CRConsAPI?method=update&api_key=cfrca&v=1.0&response_format=json'+ consUrl + ssoUrl + firstNameUrl + lastNameUrl + genderUrl + address1Url + address2Url + cityUrl + stateUrl + zipUrl;
		this.http.post(this.convioURL + this.method, null)
			.subscribe(res => {
				this.updateUserResults = res;
				console.log(this.updateUserResults);
				this.router.navigate(['/step-03']);
			}, (err) => {
				// console.log('There was an error getting the Participation Info:')
				console.log(err);
			});
	}

	// Update User Information (save for later)
	updateUserSave() {
		const consUrl = '&cons_id='+ this.storageConsID;
		const ssoUrl = '&sso_auth_token='+ this.storageToken;
		const firstNameUrl = '&name.first=' + this.liveFirstName;
		const lastNameUrl = '&name.last=' + this.liveLastName;
		const address1Url = '&primary_address.street1=' + this.liveAddress1;
		const address2Url = '&primary_address.street2=' + this.liveAddress2;
		const cityUrl = '&primary_address.city=' + this.liveCity;
		const stateUrl = '&primary_address.state=' + this.liveState;
		const zipUrl = '&primary_address.zip=' + this.liveZip;
		const genderUrl = '&gender=' + this.genderSelect;

		// Checking if input data is undefined if so set it as what it previously was (to prevent data getting saved as undefined)
		if (this.liveFirstName === undefined) {
			const firstNameUrl = '&name.first=' + this.firstName;
		}
		if (this.liveLastName === undefined) {
			const lastNameUrl = '&name.first=' + this.lastName;
		}
		if (this.liveAddress1 === undefined) {
			const address1Url = '&primary_address.street1=' + this.primaryAddress1;
		}
		if (this.liveAddress2 === undefined) {
			const address2Url = '&primary_address.street2=' + this.primaryAddress2;
		}
		if (this.primaryAddress2 || this.liveAddress2  === null) {
			this.primaryAddress2 = '';
			this.liveAddress2 = '';
		}
		if (this.liveCity === undefined) {
			const cityUrl = '&primary_address.city=' + this.primaryCity;
		}
		if (this.liveState === undefined) {
			const stateUrl = '&primary_address.city=' + this.primaryState;
		}
		if (this.liveZip === undefined) {
			const zipUrl = '&primary_address.zip=' + this.primaryZip;
		}

		this.method = 'CRConsAPI?method=update&api_key=cfrca&v=1.0&response_format=json'+ consUrl + ssoUrl + firstNameUrl + lastNameUrl + genderUrl + address1Url + address2Url + cityUrl + stateUrl + zipUrl;

		this.http.post(this.convioURL + this.method, null)
			.subscribe(res => {
				this.updateUserResults = res;
				console.log(this.updateUserResults);
				this.snackBar.open("Your information has been saved!", "Close", {
                        duration: 3500,
                        extraClasses: ['saved-info']
                });
			}, (err) => {
				// console.log('There was an error getting the Participation Info:')
				console.log(err);
			});
	}

	// Get Team Information
	getTeam() {
		this.method = 'CRTeamraiserAPI?method=getTeam&api_key=cfrca&v=1.0&response_format=json&fr_id='+ this.eventID + '&sso_auth_token='+ this.storageToken;
		this.http.post(this.convioURL + this.method, null)
			.subscribe(res => {
				this.getTeamRes = res;
				// console.log(this.getTeamRes);
				this.teamName = this.getTeamRes.getTeamResponse.team.name;
			}, (err) => {
				// console.log('There was an error getting the getTeam Info');
				console.log(err);
			});
	}
}
