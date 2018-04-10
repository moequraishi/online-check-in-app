import { Component, OnInit, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss']
})
export class StepperComponent implements OnInit {
	@ViewChild('step01') el:ElementRef;
 	@ViewChild('step02') el2:ElementRef;
 	@ViewChild('step03') el3:ElementRef;
 	@ViewChild('step04') el4:ElementRef;
 	@ViewChild('step05') el5:ElementRef;
 	@ViewChild('step06') el6:ElementRef;
 	@ViewChild('step07') el7:ElementRef;
 	@ViewChild('step08') el8:ElementRef;
 	@ViewChild('hideMe') hide:ElementRef;

 	@ViewChild('txtActive') txtActive:ElementRef;

	constructor(private renderer: Renderer2, private router: Router) { }

	ngOnInit() { }

	ngAfterViewInit() {
		// Adding active class to the stepper

	    this.renderer.addClass(this.el.nativeElement, 'active');

		if (this.router.url === '/step-02'){
		    this.renderer.addClass(this.el.nativeElement, 'active');

		    this.el.nativeElement.classList.add('current');
		}

		if (this.router.url === '/step-03'){
			this.renderer.addClass(this.el.nativeElement, 'active');
		    this.renderer.addClass(this.el2.nativeElement, 'active');

		    this.el2.nativeElement.classList.add('current');
		}

		if (this.router.url === '/step-04'){
			this.renderer.addClass(this.el2.nativeElement, 'active');
		    this.renderer.addClass(this.el3.nativeElement, 'active');

		    this.el3.nativeElement.classList.add('current');
		}

		if (this.router.url === '/step-05'){
			this.renderer.addClass(this.el2.nativeElement, 'active');
		    this.renderer.addClass(this.el3.nativeElement, 'active');
		    this.renderer.addClass(this.el4.nativeElement, 'active');

		    this.el4.nativeElement.classList.add('current');
		}

		if (this.router.url === '/step-06'){
			this.renderer.addClass(this.el2.nativeElement, 'active');
		    this.renderer.addClass(this.el3.nativeElement, 'active');
		    this.renderer.addClass(this.el4.nativeElement, 'active');
		    this.renderer.addClass(this.el5.nativeElement, 'active');

		    this.el5.nativeElement.classList.add('current');
		}

		if (this.router.url === '/step-07'){
			this.renderer.addClass(this.el2.nativeElement, 'active');
		    this.renderer.addClass(this.el3.nativeElement, 'active');
		    this.renderer.addClass(this.el4.nativeElement, 'active');
		    this.renderer.addClass(this.el5.nativeElement, 'active');
		    this.renderer.addClass(this.el6.nativeElement, 'active');

		  	this.el6.nativeElement.classList.add('current');
		}

		if (this.router.url === '/step-08'){
			this.renderer.addClass(this.el2.nativeElement, 'active');
		    this.renderer.addClass(this.el3.nativeElement, 'active');
		    this.renderer.addClass(this.el4.nativeElement, 'active');
		    this.renderer.addClass(this.el5.nativeElement, 'active');
		    this.renderer.addClass(this.el6.nativeElement, 'active');
		    this.renderer.addClass(this.el7.nativeElement, 'active');

		    this.el7.nativeElement.classList.add('current');
		}

		if (this.router.url === '/step-09'){
			this.renderer.addClass(this.el2.nativeElement, 'active');
		    this.renderer.addClass(this.el3.nativeElement, 'active');
		    this.renderer.addClass(this.el4.nativeElement, 'active');
		    this.renderer.addClass(this.el5.nativeElement, 'active');
		    this.renderer.addClass(this.el6.nativeElement, 'active');
		    this.renderer.addClass(this.el7.nativeElement, 'active');
		    this.renderer.addClass(this.el8.nativeElement, 'active');

		    this.el8.nativeElement.classList.add('current');
		}

		if (this.router.url === '/'){
		    this.renderer.addClass(this.hide.nativeElement, 'hide');
		}	

	}

}
