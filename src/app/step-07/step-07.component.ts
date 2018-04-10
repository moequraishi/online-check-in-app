import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

/* HTTP Client to retrieve data */
import { HttpClient, HttpRequest, HttpEvent, HttpEventType } from '@angular/common/http';

/* Angular Material */
import { MatSnackBar } from '@angular/material';

/* Data Service */
import { DataService } from '../data.service';

@Component({
  selector: 'app-step-07',
  templateUrl: './step-07.component.html',
  styleUrls: ['./step-07.component.scss']
})
export class Step07Component implements OnInit {
	
	// Setting the FlowStep
	flowStep:string = '6';
	flowStepResults:any={};
	getFlowStepNumber:string;

	// Method for API
	method:string;

	// getSurvey Results Data
	surveyResults:any={};
	upsellResponse:string;
	hiddenUpsellID:string;

	// Fundraising Results Data
	fundResponse:any = {};
	minimumGoal:string;
	amountRaised:string;
	fundsMet:boolean = true;

	// Get Team Results Data
	getTeamRes:any={};
	teamName:any={};

	// Team Fundraising Variables
	teamFundResponse:any={};
	teamExcessFunds:number = 0;
	partMin:any;
	teamTotalMin:number;
	totalMinRequired:number = 0;
	allTeamRaised:number = 0;
	teamFundsNeeded:number;
	totalFundsNeeded:number;
	totalCompleted:number;

	// Get Participants Results Data
	getParticipantRes:any={};

	// Consituent ID
	consID:string;

	// Registration Response Data
	regResponse:any={};
	updateRegRes:any={};
	checkinStatus:string;
	checkInCommitted:boolean = true;

	// Get DSP/ISP ID Results
	linksResult:any = {};
	linksResultDSP:any = {};

	// ISP & DSP Variables
	ispID:string;
	ispURL:string;
	dspID:string;
	dspURL:string;
	hideDSP:boolean=true;
	hideISP:boolean=true;

	// Team boolean
	inTeam:boolean;

	constructor(private data: DataService, private http: HttpClient, private router: Router, public snackBar: MatSnackBar) {}

	ngOnInit() {
		window.scrollTo(0,0);

		// Checking logged in state, and running correct functions
		if (this.data.isLoggedIn() === true && this.data.tokenExpired === false) {
			
			// If logged in state is correct, run functions
			this.getFlowStep();

			// this.dataService.getParticipationType();
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
				
				this.consID = this.regResponse.getRegistrationResponse.registration.consId;
				this.checkinStatus = this.regResponse.getRegistrationResponse.registration.checkinStatus;
				
				if (this.checkinStatus === 'committed' || this.checkinStatus === 'paid') {
					this.checkInCommitted = false;
					this.hideDSP = false;
					this.hideISP = false;
					this.fundsMet = false;
				}

				if (this.regResponse.getRegistrationResponse.registration.teamId > 0) {
					this.inTeam = true;
				}

				this.getFundraising();
				this.getIspDspID();
				
			}, (err) => {
				console.log('There was an error getting the Registration:')
				console.log(err);
				this.data.tokenExpired = true;
				this.router.navigate(['/step-01']);
			});
	}

	// Gather Fundraising Results
	getFundraising() {
		this.method = 'CRTeamraiserAPI?method=getFundraisingResults&api_key=cfrca&v=1.0&response_format=json&cons_id=' + this.consID + '&fr_id=' + this.data.eventID;
		this.http.get(this.data.convioURL + this.method)
			.subscribe(data => {
				this.fundResponse = data;
				
				// Setting Amount Raised and Minimum required 
				const numberMin = parseInt(this.fundResponse.getFundraisingResponse.fundraisingRecord.minimumGoal);
				const numberRaised = parseInt(this.fundResponse.getFundraisingResponse.fundraisingRecord.amountRaised);

				const addDeciMin = (numberMin / 100).toFixed(2);
				const addDeciRaised = (numberRaised / 100).toFixed(2);

				const newMin = addDeciMin.toString();
				const newRaised = addDeciRaised.toString();

				this.amountRaised = newRaised;
				this.minimumGoal = newMin;

				// Total Funds needed math
				this.totalFundsNeeded = numberMin - numberRaised;
				
				const totalFundsDeci = (this.totalFundsNeeded / 100).toFixed(2);

				// Algorithm for Normal Fundraising
				if (this.checkinStatus === 'paid' && this.checkInCommitted === false) {
					// console.log('Status is Paid and Has met funding requirements');
					this.hideDSP = false;
					this.hideISP = false;
					this.fundsMet = false;
				}

				if (this.upsellResponse === 'No' && this.totalFundsNeeded <= 0) {
					this.hideDSP = false;
					this.hideISP = false;
					this.fundsMet = false;
				}

				if (this.totalFundsNeeded > 0 && this.upsellResponse === 'No') {
					// console.log('No upsell selected and Funds needed exceeds 0');
				}

				if (this.upsellResponse === 'Yes' && this.totalFundsNeeded <= 0) {
					this.ispURL += '&addonID=' + this.hiddenUpsellID;
					this.dspURL += '&addonID=' + this.hiddenUpsellID;
					this.hideDSP = false;
					this.fundsMet = true;
				} else if (this.upsellResponse === 'Yes' && this.totalFundsNeeded >= 0) {
					this.ispURL += '&addonID=' + this.hiddenUpsellID;
					this.dspURL += '&addonID=' + this.hiddenUpsellID;
				}

				if (this.upsellResponse === 'Yes' && this.totalFundsNeeded <= 0 && this.checkinStatus === 'paid') {
					this.hideDSP = false;
					this.hideISP = false;
					this.fundsMet = false;
				}

				// Regular and Team Fundraising Logic (You would put OneWalk's Event ID here)
				if (this.data.eventID === '1641') {
					if (this.inTeam === true) {
						this.getTeam();
					}
				}
				
			}, 
			(error) => {
				if (error) {
					console.log(error);
				}
			});
	}

	// Get the DSP and ISP IDs (used for DSP/ISP addon links)
	getIspDspID() {

		// ISP API Call
		const methodISP = 'CRTeamraiserAPI?method=getEventDataParameter&api_key=cfrca&v=1.0&response_format=json&fr_id=' + this.data.eventID + '&edp_name=F2F_OCI_ISP_FORM_ID';
		this.http.post(this.data.convioURL + methodISP, null)
			.subscribe(res => {
				this.linksResult = res;

				this.ispID = this.linksResult.getEventDataParameterResponse.stringValue;

				// console.log(this.linksResult);

				this.ispURL = 'http://to18.conquercancer.ca/site/Donation2?df_id='+ this.ispID +'&'+ this.ispID +'.donation=form1&mfc_pref=T&TRRemainder';
				// console.log(this.ispURL);
			}, (err) => {
				if (err) {
					console.log('There was an error!');
				}
			});

		// DSP API Call
		const methodDSP = 'CRTeamraiserAPI?method=getEventDataParameter&api_key=cfrca&v=1.0&response_format=json&fr_id=' + this.data.eventID + '&edp_name=F2F_OCI_DSP_FORM_ID';
		this.http.post(this.data.convioURL + methodDSP, null)
			.subscribe(res => {
				this.linksResultDSP = res;

				this.dspID = this.linksResultDSP.getEventDataParameterResponse.stringValue;

				// console.log(this.linksResultDSP);

				this.dspURL = 'http://to18.conquercancer.ca/site/Donation2?df_id='+ this.dspID +'&'+ this.dspID +'.donation=form1&mfc_pref=T&TRRemainder';

				// console.log(this.dspURL);
			}, (err) => {
				if (err) {
					console.log('There was an error!');
				}
			});
		
	}

	// Gather Survery Results 
	getSurvey() {
		this.data.method = 'CRTeamraiserAPI?method=getSurveyResponses&api_key=cfrca&v=1.0&fr_id=' + this.data.eventID + '&survey_id=' + this.data.surveyID + '&sso_auth_token=' + this.data.ssoToken + '&response_format=json';
		this.http.post(this.data.convioURL + this.data.method, null)
			.subscribe(res => {
				this.surveyResults = res;
				// console.log(this.surveyResults);

				// For loop to loop through the responded data from API call
				for (let data of this.surveyResults.getSurveyResponsesResponse.responses) {
					// If questionId is same as waiver question ID in Survey then check if fullName variable is undefined or null, if so set it as the response value else if it's length is equil to 0 or no reponseValue, then set it to a blank string
					if (data.questionId === this.data.question6) {
						this.upsellResponse = data.responseValue;
					}
					if (data.questionId === this.data.question16) {
						this.hiddenUpsellID = data.responseValue;
					}
				}

				this.getRegInfo();
				// console.log(this.upsellHiddenResult);
			}, 
			(err) => {
				if (err.status === 403) {

					this.data.logOut();
					this.snackBar.open("Your login session has expired. Please login again.", "Close", {
                        duration: 13500,
                        extraClasses: ['error-info']
               		});
               		this.router.navigate(['/step-01']);
				}
			});
	}

	// Get Team Information
	getTeam() {
		this.method = 'CRTeamraiserAPI?method=getTeam&api_key=cfrca&v=1.0&response_format=json&fr_id='+ this.data.eventID + '&sso_auth_token='+ this.data.storageToken;
		this.http.post(this.data.convioURL + this.method, null)
			.subscribe(res => {
				this.getTeamRes = res;
				this.teamName = this.getTeamRes.getTeamResponse.team.name;
				
				this.getParticipantList();
			}, (err) => {
				console.log(err);
			});
		
	}

	// Get Participants for Team Fundraising
	getParticipantList() {

		const checkComplete = 'complete';

		// Filters for the API Call to get the Participants with completed status
		const filters = '&fr_id='+ this.data.eventID + '&sso_auth_token='+ this.data.storageToken +'&team_name='+ this.teamName + '&list_filter_column=reg.CHECKIN_STATUS'+ '&list_filter_text=' + checkComplete +'&list_page_size=500';
		this.method = 'CRTeamraiserAPI?method=getParticipants&api_key=cfrca&v=1.0&response_format=json';

		// Get call to get all the participants with the completed Status
		this.http.post(this.data.convioURL + this.method + filters, null)
			.subscribe(res => {
				this.getParticipantRes = res;
				// console.log(this.getParticipantRes.getParticipantsResponse.participant);

				// Checking if the data returns information
				if (this.getParticipantRes.getParticipantsResponse.participant) {

					this.totalCompleted = this.getParticipantRes.getParticipantsResponse.participant.length;
					
					// Checking if the participant amount is greater than 1
					if (this.totalCompleted > 0) {

						// Team Donation API Call IF/ELSE run for loop

						// If more than 1, run a for loop on all the participants
						for (let participants of this.getParticipantRes.getParticipantsResponse.participant) {

							// const partRaised = parseInt(participants.amountRaised);

							// Calculate all of the finished team members total funds raised
							this.allTeamRaised += parseInt(participants.amountRaised);

							// Do a call to get the fundraising results for each participant in this loop or team
							this.method = 'CRTeamraiserAPI?method=getFundraisingResults&api_key=cfrca&v=1.0&response_format=json&cons_id=' + participants.consId + '&fr_id=' + this.data.eventID;

							this.http.get(this.data.convioURL + this.method)
								.subscribe(data => {
									this.teamFundResponse = data;
									this.partMin = parseInt(this.teamFundResponse.getFundraisingResponse.fundraisingRecord.minimumGoal);
									
									// If the participant's amountRaised is greater than their minimum add the balance to the teamExcess
									if (participants.amountRaised > this.partMin) {
										this.totalMinRequired += (this.partMin * this.totalCompleted);

										this.teamExcessFunds = this.allTeamRaised - this.totalMinRequired;
										// console.log('Total team raised amount: ' + this.allTeamRaised);
										// console.log('Total minimum required: ' + this.totalMinRequired);
										// console.log('Total excess funds: ' + this.teamExcessFunds);
									}

									if (this.teamExcessFunds >= this.totalFundsNeeded && this.upsellResponse === 'No') {
										this.fundsMet = false;
										this.hideDSP = false;
										this.hideISP = false;
									} else if (this.teamExcessFunds >= this.totalFundsNeeded && this.upsellResponse === 'Yes') {
										this.hideDSP = false;
									}

								}, (err) => {
									console.log(err);
								});
						}
					} else {

						// If the team only has 1 participant
						const raisedFunds = parseInt(this.getParticipantRes.getParticipantsResponse.participant.amountRaised);
	
						const calculatedExcess = raisedFunds 


						// Do a call to get the fundraising results for the 1 participant that has completed the OCI in this team
							this.method = 'CRTeamraiserAPI?method=getFundraisingResults&api_key=cfrca&v=1.0&response_format=json&cons_id=' + this.getParticipantRes.getParticipantsResponse.participant.consId + '&fr_id=' + this.data.eventID;

						this.http.get(this.data.convioURL + this.method)
							.subscribe(data => {
								this.teamFundResponse = data;

								this.partMin = parseInt(this.teamFundResponse.getFundraisingResponse.fundraisingRecord.minimumGoal);

								this.partMin += this.totalFundsNeeded;

								const participantRaised1 = parseInt(this.fundResponse.getFundraisingResponse.fundraisingRecord.amountRaised);
								const participantRaised2 = parseInt(this.getParticipantRes.getParticipantsResponse.participant.amountRaised);
								const bothRaised = participantRaised1 + participantRaised2;
								
								// If the participant's amountRaised is greater than their minimum add the balance to the teamExcess
								if (bothRaised >= this.partMin && this.upsellResponse === 'No') {
									this.fundsMet = false;
									this.hideDSP = false;
									this.hideISP = false;
								} else if (bothRaised >= this.partMin && this.upsellResponse === 'Yes') {
									this.hideDSP = false;
								}

							}, (err) => {
								console.log(err);
							});
					}
				}
				
			},
			(err) =>  {
				console.log(err);
			});
	}

	// Update the current Flowstep
	updateFlowStep() {
		this.data.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.data.eventID + '&sso_auth_token=' + this.data.ssoToken + '&flow_step=' + this.flowStep + '&response_format=json';
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
		this.flowStep = '7';
		this.data.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.data.eventID + '&sso_auth_token=' + this.data.ssoToken + '&flow_step=' + this.flowStep + '&response_format=json';
		this.http.post(this.data.convioURL + this.data.method, null) 
			.subscribe(res => {
				// Update the flowStep to the next flowstep once everything checks out properly
				this.router.navigate(['/step-08']);
			}, (err) => {
				if (err) {
					console.log('There was an error updating the flowstep.');
				}
			});
	}

	// Update the current Flowstep
	previousFlowStep() {
		this.flowStep = '5';
		this.data.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.data.eventID + '&sso_auth_token=' + this.data.ssoToken + '&flow_step=' + this.flowStep + '&response_format=json';
		this.http.post(this.data.convioURL + this.data.method, null) 
			.subscribe(res => {

				// Route user to previous flow step
				this.router.navigate(['/step-06']);
			}, (err) => {
				if (err) {
					console.log('There was an error updating the flowstep.');
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
					this.getSurvey();
					this.data.getUserInfo();
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

	reload() {
		window.location.reload();
	}

}
