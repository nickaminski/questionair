import { Component, Input, OnInit } from '@angular/core';
import { Poll, PollService } from '../services/poll.service';

@Component({
  selector: 'app-poll-card',
  templateUrl: './poll-card.component.html',
  styleUrls: ['./poll-card.component.scss']
})
export class PollCardComponent {

  @Input() poll: Poll;

  constructor(private pollService: PollService) { }

  expired(): boolean {
    return this.pollService.expired(this.poll) && !this.answered();
  }

  answered(): boolean {
    return this.poll.answered;
  }
  
}
