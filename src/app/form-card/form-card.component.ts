import { Component, Input, OnInit } from '@angular/core';
import { FormModel } from '../services/form.service';

@Component({
  selector: 'app-form-card',
  templateUrl: './form-card.component.html',
  styleUrls: ['./form-card.component.scss']
})
export class FormCardComponent {

  @Input() form: FormModel;

  constructor() { }

  ngOnInit(): void {
    
  }

}
