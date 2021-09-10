import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { api_url } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FormService {

  constructor(private httpClient: HttpClient) { }

  getForm(formId: string): Observable<FormModel> {
    return this.httpClient.get<FormModel>(`${api_url}/Form/?id=${formId}`);
  }

  getAllForms(): Observable<FormModel[]> {
    return this.httpClient.get<FormModel[]>(`${api_url}/Form`);
  }

  createForm(formData: FormModel): Observable<string> {
    var copy = Object.assign({}, formData);
    copy.sections.forEach(x => {
      x.questions.forEach(y => {
        y.jsonAnswerContent = JSON.stringify(y.answerContent);
        y.answerContent = undefined;
      });
    });
    return this.httpClient.post<string>(`${api_url}/Form`, copy);
  }

  updateForm(formData: FormModel): Observable<boolean> {
    var copy = Object.assign({}, formData);
    copy.sections.forEach(x => {
      x.questions.forEach(y => {
        y.jsonAnswerContent = JSON.stringify(y.answerContent);
        y.answerContent = undefined;
      });
    });
    return this.httpClient.put<boolean>(`${api_url}/Form`, copy);
  }
}

export interface FormModel {
  sections: FormSection[];
  formId: string;
}

interface FormSection {
  sectionId: string;
  sectionTitle: string;
  sectionDescription: string;
  questions: QuestionData[];
}

interface QuestionData {
  questionText: string;
  questionType: string;
  questionImage: string;
  required: boolean;
  id: string;
  jsonAnswerContent: string;
  answerContent: any;
}