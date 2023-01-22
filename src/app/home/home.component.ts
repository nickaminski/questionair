import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CancelService } from '../cancel.service';
import { FormModel, FormService } from '../services/form.service';
import { Poll, PollService } from '../services/poll.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @ViewChild(MatTabGroup) tabGroup: MatTabGroup;

  existingPolls$: Observable<Poll[]>;
  pollFetchCompleted = false;
  pollFetchCount = 0;

  existingForms$: Observable<FormModel[]>;
  formFetchCompleted = false;
  formFetchCount = 0;

  constructor(private pollService: PollService, private formServie: FormService, private activatedRout: ActivatedRoute, private canceller: CancelService) { }

  ngOnInit(): void {
    this.setupServiceCalls();

    this.activatedRout.fragment.subscribe(fragment => {
      if (fragment)
      {
        if (fragment === 'forms') {
          this.tabGroup.selectedIndex = 1;
        }
      }
    });
  }

  setupServiceCalls() {
    this.existingPolls$ = this.pollService.getAll()
    .pipe(
      catchError(err => { 
        return of([]);
      }),
      tap(polls => {
        this.pollFetchCompleted = true;
        this.pollFetchCount = polls.length;
      })
    );

    this.existingForms$ = this.formServie.getAllForms()
      .pipe(
          catchError(err => {
            return of([]);
          }), 
          tap(forms => {
            this.formFetchCompleted = true;
            this.formFetchCount = forms.length;
          })
      );
  }

  invalidPoll(poll: Poll): boolean {
    return this.pollService.invalid(poll);
  }

  searching: boolean;
  currentRequest: Subscription;

  doCancelableSearch() {
    if (this.searching) return;
    
    this.searching = true;
    this.currentRequest = this.canceller.doCancelableCall().subscribe({
      next: result => console.log('successfully returned'),
      error: err => console.log('errored: ' + err),
      complete: () => { console.log('completed!'); this.searching = false; }
    });
  }

  cancelSearch() {
    if (this.currentRequest && !this.currentRequest.closed) {
      this.currentRequest.unsubscribe();
      this.searching = false;
      console.log('cancelled!');
    }
  }

  viewSubscription() {
    console.log(this.currentRequest);
  }
}
