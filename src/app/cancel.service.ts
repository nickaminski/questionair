import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { api_url } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CancelService {

  constructor(private httpClient: HttpClient) { }

  public doCancelableCall(): Observable<any> {
    return this.httpClient.get(`${api_url}/Cancel`);
  }
}
