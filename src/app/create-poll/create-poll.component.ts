import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PollService } from '../services/poll.service';

@Component({
  selector: 'app-create-poll',
  templateUrl: './create-poll.component.html',
  styleUrls: ['./create-poll.component.scss']
})
export class CreatePollComponent implements OnInit {

  myForm: FormGroup;
  hours: number[];
  minutes: number[];
  submitted: boolean;
  pollId: string;
  pollQuestion: string;

  constructor(private fb: FormBuilder, private pollService: PollService, private router: Router) { }

  ngOnInit(): void {
    this.hours = [];
    for (var i = 1; i <= 12; i++) this.hours.push(i);
    this.minutes = [0, 15, 30, 45];

    let now = new Date();
    now.setDate(now.getDate() + 1);
    this.myForm = this.fb.group({
      question: ['', [Validators.required, Validators.pattern('.*[^ ].*')]],
      expirationDate: [now, Validators.required],
      expirationTime: this.fb.group({
        hour: [12],
        minute: [0],
        meridiem: ['AM']
      }),
      options: this.fb.array([this.buildOption(), this.buildOption()])
    });
  }

  get question() {
    return this.myForm.get('question');
  }

  get options() {
    return this.myForm.get('options') as FormArray;
  }

  onSubmit() {
    this.pollService.createPoll(this.myForm.value).subscribe(response => {
      if (response && response.id)
      {
        this.submitted = true;
        this.pollId = response.id;
        this.pollQuestion = response.question;
      }
    });
  }

  refresh() {
    location.reload();
  }

  addOption(): void {
    this.options.push(this.buildOption());
  }

  buildOption(): FormGroup {
    return this.fb.group({ 
      text: ['', [Validators.required, Validators.pattern('[^ ]+.*')]]
    });
  }

  deleteOption(i: number) {
    this.options.removeAt(i);
  }

}
