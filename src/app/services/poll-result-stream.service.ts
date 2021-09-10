import { Injectable } from '@angular/core';
import { signalR_url } from 'src/environments/environment';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Observable, Subject } from 'rxjs';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class PollResultStreamService {

  private hubConnection: HubConnection;

  private onVoteReceivedSubject = new Subject<MessagePacket>();
  public onVoteReceived$: Observable<MessagePacket>;

  constructor(private logger: LoggerService) { 
    this.onVoteReceived$ = this.onVoteReceivedSubject.asObservable();
  }

  public startConnection(pollId: string) {
    this.hubConnection = new HubConnectionBuilder().withUrl(signalR_url).build();
    this.hubConnection.start()
                      .then(() => {
                        this.hubConnection.send('joinChannel', `Pollar-${pollId}`);
                      })
                      .catch(err => this.logger.logError(`${err}`));

    this.hubConnection.on('broadcastToChannel', (message: MessagePacket) => {
      if (message.username !== 'System')
      {
        this.onVoteReceivedSubject.next(message);
      }
    });
  }

  public closeConnection() {
    this.hubConnection.send('leaveChannel').then(() => {
      this.hubConnection.stop();
    });
  }
}

export interface MessagePacket {
  message: string;
  timestamp: number;
  username: string;
  userId: string;
}