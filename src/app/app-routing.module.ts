import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateFormComponent } from './create-form/create-form.component';
import { CreatePollComponent } from './create-poll/create-poll.component';
import { HomeComponent } from './home/home.component';
import { PollResultsComponent } from './poll-results/poll-results.component';
import { ViewPollComponent } from './view-poll/view-poll.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'createPoll', component: CreatePollComponent },
  { path: 'poll/:pollId', component: ViewPollComponent},
  { path: 'results/:pollId', component: PollResultsComponent },
  { path: 'edit', component: CreateFormComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
