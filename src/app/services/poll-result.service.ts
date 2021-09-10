import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { api_url } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PollResultService {

  constructor(private httpClient: HttpClient) { }

  getResults(pollId: string): Observable<PollResults> {
    return this.httpClient.get<PollResults>(`${api_url}/Poll/GetPollResults/?id=${pollId}`);
  }

  submitPollResponse(pollId: string, selectedChoice: string): Observable<boolean> {
    var body = {
      id: pollId,
      selectedChoice: selectedChoice
    };
    return this.httpClient.post<boolean>(`${api_url}/Poll/SubmitPollResponse`, body);
  }
}

export interface PollResults {
  pollId: string;
  question: string;
  userChoice: string;
  results: Map<string, number>;
}
