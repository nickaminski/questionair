import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { api_url, logger_max_retries } from 'src/environments/environment';
import { GuidService } from './guid.service';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  private initialRequestTime = 1000;
  public messageQueue: LoggerMessage[];
  private requestTime: number;
  private inFlight: boolean;

  constructor(private http : HttpClient, private guid: GuidService) { 
    this.messageQueue = [];
    this.inFlight = false;
    this.requestTime = this.initialRequestTime;
  }

  logInfo(message: string) {
    this.addMessage(message, 'Info');
  }

  logWarning(message: string) {
    this.addMessage(message, 'Warning');
  }

  logError(message: string) {
    this.addMessage(message, 'Error');
  }

  private addMessage(message: string, level: string) {
    this.messageQueue.push({
      id: this.guid.newGuid(),
      message: message,
      level: level,
      timestamp: new Date(),
      retryCount: 0,
      source: 'pollar'
    });

    if (!this.inFlight && this.messageQueue.length == 1) {
      this.sendMessage(this.getMessageToSend());
    }
  }

  private sendMessage(loggerMessage : LoggerMessage) {
    console.log(loggerMessage);
    if (!loggerMessage) {
      console.warn('Bad message in sendMessage');
      return null;
    }

    this.inFlight = true;
    return this.http.post(`${api_url}/Logging`, loggerMessage).subscribe(response => 
      {
        this.inFlight = false;
        if (!response) {
          this.handleError(loggerMessage);
        } else if (this.messageQueue.length > 0) {
          this.requestTime = this.initialRequestTime;
          this.sendMessage(this.getMessageToSend());
        }
      }, 
      (error) => this.handleError(loggerMessage));
  }

  private handleError(result: LoggerMessage) {
    if (result.retryCount > logger_max_retries) {
      console.log(`Message abandoned: ${result.id} ${result.level} ${result.message} ${result.timestamp}`);
    } else {
      result.retryCount = result.retryCount + 1;
      setTimeout(() => this.sendMessage(result), this.requestTime);
      this.rampUpRequestTime();
    }
  }

  private getMessageToSend() : LoggerMessage {
    if (!this.messageQueue || this.messageQueue.length <= 0) {
      return null;
    }

    return this.messageQueue.splice(0, 1)[0];
  }

  private rampUpRequestTime() {
    if (this.requestTime < 5000)
      this.requestTime += this.initialRequestTime;
  }
}

interface LoggerMessage {
  id: string;
  message: string;
  level: string;
  timestamp: Date;
  retryCount: number;
  source: string;
}