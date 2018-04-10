import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit {
 	

	torontoLogoURL:string='http://ride.conquercancer.ca/toronto/wp-content/uploads/sites/2/2018/01/rcto_2018_logo_rgb_full.svg';
	torontoLogo:string='assets/images/event_logo.png';

	constructor(private dataService: DataService) {}

	ngOnInit() {}

	// Calling on the isLoggedIn() function from the global data service to check the logged in state
	isLoggedIn() {
		return this.dataService.isLoggedIn();
	}

}
