import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { PollResultStreamService } from '../services/poll-result-stream.service';
import { PollResultService } from '../services/poll-result.service';

@Component({
  selector: 'app-poll-results',
  templateUrl: './poll-results.component.html',
  styleUrls: ['./poll-results.component.scss']
})
export class PollResultsComponent implements OnInit, OnDestroy {

  selectedId: string;
  question: string;

  chartData: any[];

  constructor(private route: ActivatedRoute, private pollResultsService: PollResultService, private pollResultStreamService: PollResultStreamService) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        this.selectedId = params.get('pollId');
        return this.pollResultsService.getResults(this.selectedId);
      })
    ).subscribe(response => {
      const pollResults = response;

      this.chartData = Object.keys(pollResults.results).map((key) => {
        return { name: key, value: pollResults.results[key] };
      });
      
      this.question = pollResults.question;

      this.pollResultStreamService.startConnection(this.selectedId);
    }, 
    err => {
    });

    this.pollResultStreamService.onVoteReceived$.subscribe(pollChoice => {
      if (pollChoice.userId !== this.selectedId)
        return;

      const index = this.chartData.findIndex(x => x.name === pollChoice.message);
      if (index !== -1) {
        this.chartData[index].value += 1;
        this.chartData = [...this.chartData];
      }
    });
  }
  
  ngOnDestroy() {
    this.pollResultStreamService.closeConnection();
  }

}