import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RegisterComponent implements OnInit {

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    terms: [false, Validators.required]
  });
  repeatedEmail: boolean = false;
  origin: string = "";

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.origin = params.from;
    });
  }

  validateField(field: string) {
    return this.form.controls[field].invalid && this.form.controls[field].touched;
  }

  validateTerms() {
    return !this.form.controls.terms.value;
  }

  validateForm() {
    this.repeatedEmail = false;
    if (this.form.controls.terms.value === false) return;
    if (localStorage.getItem('email') && localStorage.getItem('email') === this.form.controls['email'].value) {
      this.repeatedEmail = true;
      return;
    }
    this.register();
  }

  touched(field: string): boolean {
    return this.form.controls[field].touched;
  }

  validInput(field: string): boolean {
    return this.form.controls[field].valid;
  }

  check_uncheck(): void {
    this.form.controls.terms.setValue(!this.form.controls.terms.value);
  }

  register() {
    // Reset collected coins
    localStorage.removeItem(environment.id1);
    localStorage.removeItem(environment.id2);
    localStorage.removeItem(environment.id3);
    // Reset/initialize data
    localStorage.setItem('email', this.form.controls.email.value);
    localStorage.setItem('name', this.form.controls.name.value);
    localStorage.setItem('lastName', this.form.controls.lastName.value);
    localStorage.setItem('score', '0');
    this.router.navigate(['/game', this.origin]);
  }

}
