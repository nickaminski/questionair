import { Component, OnInit } from '@angular/core';
import { Poll, PollService as PollService } from '../services/poll.service';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { PollResultService } from '../services/poll-result.service';

@Component({
  selector: 'app-view-poll',
  templateUrl: './view-poll.component.html',
  styleUrls: ['./view-poll.component.scss']
})
export class ViewPollComponent implements OnInit {

  selectedId: string;
  currentPoll: Poll;
  loading: boolean;

  selectedOption: FormControl;

  constructor(private route: ActivatedRoute, private resultService: PollResultService, private pollService: PollService, private fb: FormBuilder, private router: Router) { }

  ngOnInit(): void {
    this.selectedOption = this.fb.control('', Validators.required);

    this.loading = true;
    this.route.paramMap.pipe(
      switchMap(params => {
        this.selectedId = params.get('pollId');
        return this.pollService.getPoll(this.selectedId);
      })
    ).subscribe(response => {
      this.currentPoll = response;
      this.loading = false;

      if(this.pollService.invalid(this.currentPoll)) {
        this.router.navigate(['/results', this.currentPoll.id]);
      }
    }, 
    err => {
      this.loading = false;
    });
  }

  submitForm() {
    this.resultService.submitPollResponse(this.selectedId, this.selectedOption.value).subscribe(response => {
      if (response) {
        this.currentPoll.answered = true;
        this.router.navigate(['/results', this.currentPoll.id]);
      }
    });
  }

  expired(poll: Poll): boolean {
    var date = new Date(poll.expirationDate);
    var hours = 0;
    hours += poll.expirationTime.hour;
    if (poll.expirationTime.meridiem === 'PM')
    {
      hours += 12;
    }
    if (poll.expirationTime.hour === 12 && poll.expirationTime.meridiem === 'AM')
    {
      hours = 0;
    }
    date.setHours(hours, poll.expirationTime.minute, 59);

    return new Date() > date;
  }

}
