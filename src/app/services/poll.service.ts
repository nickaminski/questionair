import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { api_url } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PollService {

  constructor(private httpClient: HttpClient) { }

  createPoll(newPoll: Poll): Observable<Poll> {
    return this.httpClient.put<Poll>(`${api_url}/Poll/CreatePoll`, newPoll);
  }

  getAll(): Observable<Poll[]> {
    return this.httpClient.get<Poll[]>(`${api_url}/Poll/GetAll`);
  }

  getPoll(pollId: string): Observable<Poll> {
    return this.httpClient.get<Poll>(`${api_url}/Poll/GetPoll/?id=${pollId}`);
  }

  invalid(poll: Poll): boolean
  {
    return poll.answered || this.expired(poll);
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

export interface Poll {
  id: string;
  question: string;
  options: any[];
  expirationDate: Date;
  expirationTime: {
    hour: number;
    minute: number;
    meridiem: string;
  };
  totalResponses: number;
  answered: boolean;
}