import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, map, switchMap } from 'rxjs/operators';
import { form_options, google_api_key } from 'src/environments/environment';
import { FormModel, FormService } from '../services/form.service';
import { GuidService } from '../services/guid.service';
import { LoggerService } from '../services/logger.service';

@Component({
  selector: 'app-create-form',
  templateUrl: './create-form.component.html',
  styleUrls: ['./create-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreateFormComponent implements OnInit, OnDestroy {

  theForm: FormGroup;

  selectedQuestionType: any;
  selectedElem: any;

  currentSectionIndex = 0;
  currentQuestionIndex = -1;

  listenerRef: any;
  rippleColor = 'rgba(0, 0, 0, .25)';

  sidePanelHeightCorrect = 335;

  scrollingSubject: Subject<boolean>;
  scrollingObservable$: Observable<boolean>;
  scollingInstantObservable$: Observable<boolean>;

  scrollTargetId = 'scrollingElement';

  sidePanelPos = 0; 
  scrollCorrect = -76;

  sidePanelContainerPos = 0;  

  get sections(): FormArray {
    return <FormArray>this.theForm.get('sections');
  }

  get sectionIds(): string[] {
    return this.sections.controls.map(x => x.get('sectionId').value);
  }

  questions(sectionIndex: number): FormArray {
    return <FormArray>this.sections.at(sectionIndex).get('questions');
  }

  choices(sectionIndex: number, questionIndex: number): FormArray {
    return <FormArray>this.questions(sectionIndex).at(questionIndex).get('answerContent').get('choices');
  }

  rows(sectionIndex: number, questionIndex: number): FormArray {
    return <FormArray>this.questions(sectionIndex).at(questionIndex).get('answerContent').get('rows');
  }
  
  columns(sectionsIndex: number, questionIndex: number): FormArray {
    return <FormArray>this.questions(sectionsIndex).at(questionIndex).get('answerContent').get('columns');
  }

  options = [...form_options];

  apiLoaded: Observable<boolean>;

  constructor(private fb: FormBuilder, private renderer: Renderer2, private guidService: GuidService, httpClient: HttpClient, private formService: FormService, private logger: LoggerService, private snackBar: MatSnackBar, private route: ActivatedRoute, private router: Router) {
    this.apiLoaded = httpClient.jsonp(`https://maps.googleapis.com/maps/api/js?key=${google_api_key}`, 'callback')
                               .pipe(
                                  map(() => true),
                                  catchError(() => of(false))
                               );
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const id = params.formId;
      if (id) {
        this.formService.getForm(id)
                        .subscribe(response => this.generateExistingForm(response),
                                   err => this.router.navigate(['/edit']));
      }
      else {
        this.buildNewForm();
      }
    });
  }

  ngOnDestroy(): void {
    this.listenerRef();
  }

  buildNewForm() {
    this.theForm = this.fb.group({
      sections: this.fb.array([]),
      formId: undefined
    });
    this.addNewSection(0);
    
    this.questions(this.currentSectionIndex).insert(0, this.buildQuestionForm(null));
    this.questions(this.currentSectionIndex).at(0).patchValue({selected : false}, {emitEvent: false});
    this.selectedQuestionType = this.options[1].group[0];
    
    this.setupForm();
  }

  generateExistingForm(form: FormModel) {
    this.theForm = this.fb.group({
      sections: this.fb.array([]),
      formId: form.formId
    });

    for(var i = 0; i < form.sections.length; i++)
    {
      this.duplicateSection(form.sections[i]);

      for(var j = 0; j < this.questions(i).length; j++)
      {
        var currentQuestion = this.questions(i).at(j);
        currentQuestion.patchValue({selected : false}, {emitEvent: false});
      }
    }
    this.theForm.markAsPristine();

    this.setupForm();
  }

  saveForm(formData: FormModel): Observable<boolean> {
    if (formData.formId === null) {
      return this.formService.createForm(formData).pipe(
        switchMap(x => {
          if (x) {
            this.theForm.patchValue( {'formId': x}, { emitEvent: false });
            return of(true);
          }
          return of(false);
        })
      );
    }
    else
    {
      return this.formService.updateForm(formData);
    }
  }

  private setupForm() {
    this.currentSectionIndex = 0;
    this.currentQuestionIndex = -1;

    this.scrollingSubject = new Subject<boolean>();
    this.scrollingObservable$ = this.scrollingSubject.asObservable();
    this.scollingInstantObservable$ = this.scrollingSubject.asObservable();

    this.listenerRef = this.renderer.listen(document.getElementById(this.scrollTargetId), 'scroll', this.fireScrollEvent.bind(this));

    setTimeout(() => {
      this.selectedElem = document.getElementById(this.sections.at(0).value.sectionId);
      this.moveSidePanel(this.selectedElem, this.scrollCorrect);
    });

    this.scollingInstantObservable$.subscribe(complete => {
      var ref = document.getElementById(this.scrollTargetId);
      this.sidePanelContainerPos = ref.scrollTop * -1;
    });

    this.scrollingObservable$.pipe(debounceTime(40)).subscribe(complete => {
      this.moveSidePanel(this.selectedElem, this.scrollCorrect);
    });

    this.theForm.valueChanges.pipe(
      debounceTime(4000),
      switchMap(x => { 
        if (this.theForm.dirty){
          this.theForm.markAsPristine();

          return this.saveForm(x);
        }
        return of();
      })
    ).subscribe(response => {
      if (response)
        this.snackBar.open('Form Saved Successfully', null, { duration: 2500, panelClass: 'snackbar-positive' });
      else
        this.snackBar.open('Saved failed', null, { duration: 2500, panelClass: 'snackbar-negative' });
    });
  }

  private buildNewSection(sectionTitle: string): FormGroup {
    this.theForm.markAsDirty();
    return this.fb.group({
      sectionId: this.guidService.newGuid(),
      sectionTitle: sectionTitle,
      sectionDescription: '',
      folded: false,
      questions: this.fb.array([ ])
    })
  }

  drop(event: CdkDragDrop<AbstractControl[], AbstractControl[]>, sectionIndex: number) {
    if (event.previousContainer === event.container)
    {
      moveItemInArray(this.questions(sectionIndex).controls, event.previousIndex, event.currentIndex);
    }
    else
    {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      this.currentSectionIndex = sectionIndex;
      this.currentQuestionIndex = event.currentIndex;
    }

    this.theForm.markAsDirty();

    setTimeout(()=> {
      // force to pause for a frame so the element exists
      var question = this.questions(sectionIndex).controls[event.currentIndex];
      this.selectedElem = document.getElementById(question.get('id').value);
      this.moveSidePanel(this.selectedElem, this.scrollCorrect);
      this.resetSelectedQuestion();
      question.get('selected').setValue(true);
      this.currentQuestionIndex = event.currentIndex;
    });
  }

  dropAnswerChoice(event: CdkDragDrop<FormGroup[]>, list: FormArray) {
    moveItemInArray(list.controls, event.previousIndex, event.currentIndex);
    this.theForm.markAsDirty();
  }

  select(event, sectionIndex, questionIndex, isQuestion) {
    this.currentSectionIndex = sectionIndex;
    this.currentQuestionIndex = questionIndex;

    if (event) {
      var target = event.target.closest('mat-card');
      this.selectedElem = target;
      this.moveSidePanel(target, this.scrollCorrect);
    }

    this.resetSelectedQuestion();

    if (isQuestion)
    {
      this.questions(sectionIndex).controls[questionIndex].get('selected').setValue(true);
      this.updateSelectedQuestionType(this.questions(sectionIndex).controls[questionIndex].get('questionType').value);
    }
  }

  buildQuestionForm(data): FormGroup {
    this.resetSelectedQuestion();
    const group = this.fb.group({
      questionText: '',
      questionType: 'Multiple choice',
      questionImage: '',
      required: false,
      answerContent: this.buildAnswerContent('Multiple choice'),
      selected: true,
      hovering: false,
      id: this.guidService.newGuid(),
    });

    group.get('questionType').valueChanges.subscribe(value => {
      this.updateSelectedQuestionType(value);
      group.setControl('answerContent', this.buildAnswerContent(value));
    });

    if (data)
    {
      group.patchValue(data);

      if (this.isListQuestion(data.questionType))
      {
        this.duplicateAnswerChoices(data, group);
      }
      else if (this.isGridQuestion(data.questionType))
      {
        this.duplicateRowsColumns(data, group);
      }
    }

    this.theForm.markAsDirty();
    return group;
  }

  toggleQuestionMeta(question: AbstractControl, key: string) {
    question.get('answerContent').get(key).setValue(!question.get('answerContent').get(key).value);
    this.theForm.markAsDirty();
  }

  addQuestion(questionData: AbstractControl, sectionIndex: number) {
    this.currentQuestionIndex += 1;
    var formData = questionData;

    if (!formData)
    {
      formData = this.buildQuestionForm(null);
      this.questions(sectionIndex).insert(this.currentQuestionIndex, formData);
      this.selectedQuestionType = this.options[1].group[0];
    }
    else
    {
      this.questions(sectionIndex).insert(this.currentQuestionIndex, formData);
    }
    this.theForm.markAsDirty();

    setTimeout(()=> {
      // force to pause for a frame so the element exists
      this.selectedElem = document.getElementById(formData.get('id').value);
      this.moveSidePanel(this.selectedElem, this.scrollCorrect);
    });
  }

  deleteQuestion(sectionIndex: number, questionIndex: number) {
    this.questions(sectionIndex).removeAt(questionIndex);

    if (this.questions(sectionIndex).length === 0 || (this.questions(sectionIndex).length > 0 && questionIndex !== 0))
    {
      this.currentQuestionIndex -=1;
    }

    var targetId = '';

    if (this.currentQuestionIndex === -1)
    {
      targetId = this.sections.at(this.currentSectionIndex).get('sectionId').value;
    }
    else
    {
      targetId = this.questions(sectionIndex).at(this.currentQuestionIndex).get('id').value;
      this.questions(sectionIndex).at(this.currentQuestionIndex).get('selected').setValue(true);
      this.updateSelectedQuestionType(this.questions(sectionIndex).at(this.currentQuestionIndex).get('questionType').value);
    }

    this.selectedElem = document.getElementById(targetId);
    this.moveSidePanel(this.selectedElem, this.scrollCorrect);
    this.theForm.markAsDirty();
  }

  clearFileTypes() {
    this.questions(this.currentSectionIndex).at(this.currentQuestionIndex).get('answerContent').get('fileTypesAllowed').setValue([]);
  }

  fileTypeAllowed(list: string[], fileType: string): boolean {
    return list && list.includes(fileType);
  }

  toggleFileType(fileType: string) {
    var list = <string[]>this.questions(this.currentSectionIndex).at(this.currentQuestionIndex).get('answerContent').get('fileTypesAllowed').value;
    if (!list) list  = [];
    if (list.includes(fileType)) {
      list = list.filter(x => x !== fileType);
    } else {
      list.push(fileType);
    }
    this.questions(this.currentSectionIndex).at(this.currentQuestionIndex).get('answerContent').get('fileTypesAllowed').setValue(list);
  }

  duplicateQuestion(questionIndex: number) {
    var currentQuestion = this.questions(this.currentSectionIndex).at(questionIndex);
    currentQuestion.get('selected').setValue(false);
    currentQuestion.get('hovering').setValue(false);

    const copy = { ...currentQuestion.value };
    copy['selected'] = true;
    copy['id'] = this.guidService.newGuid();
    this.selectedElem = document.getElementById(copy['id'].value);
    this.addQuestion(this.buildQuestionForm(copy), this.currentSectionIndex);
    this.theForm.markAsDirty();
  }

  duplicateSection(sectionData: any) {
    var newSection = this.buildNewSection(sectionData.sectionTitle);
    newSection.get('sectionDescription').setValue(sectionData.sectionDescription);
    for(var x = 0; x < sectionData.questions.length; x++)
    {
      (<FormArray>newSection.get('questions')).insert(x, this.buildQuestionForm(sectionData.questions[x]));
    }

    this.sections.insert(this.currentSectionIndex + 1, newSection);
  }

  resetSelectedQuestion() {
    if (this.theForm && this.sections) {
      for(var i = 0; i < this.sections.length; i++)
      {
        this.questions(i).controls.forEach(element => {
          element.get('selected').setValue(false);
        });
      }
    }
  }

  addNewSection(currentIndex: number) {
    this.resetSelectedQuestion();
    let section = this.buildNewSection(this.getSectionTitle(this.sections.length));
    this.sections.insert(currentIndex + 1, section);

    if (this.sections.length !== 1)
    {
      setTimeout(()=> {
        // force to pause for a frame so the element exists
        this.selectedElem = document.getElementById(section.get('sectionId').value);
        this.currentQuestionIndex = -1;
        this.currentSectionIndex = currentIndex + 1;
        this.moveSidePanel(this.selectedElem, this.scrollCorrect);
      });
    }
  }

  checkEmptyTitle(sectionIndex: number) {
    if (!this.sections.at(sectionIndex).get('sectionTitle').value) {
      this.sections.at(sectionIndex).get('sectionTitle').setValue(this.getSectionTitle(sectionIndex));
    }
  }

  updateSelectedQuestionType(value: string) {
    var foundGroup = this.options.find(x => x.group.find(y => y.text === value));
    this.selectedQuestionType = foundGroup.group.find(y => y.text === value);
  }

  moveSidePanel(target, correction) {
    setTimeout(() => {
      const rect = target.getBoundingClientRect();
      var ref = document.getElementById(this.scrollTargetId);
      this.sidePanelPos = this.clamp(rect.y + correction + ref.scrollTop + this.sidePanelContainerPos, 
                            ref.scrollTop + this.sidePanelContainerPos,
                            ref.scrollTop + ref.getBoundingClientRect().height + this.sidePanelContainerPos);
    });
  }

  fireScrollEvent(event) {
    this.scrollingSubject.next(true);
  }

  addOption(sectionIndex: number, questionIndex: number, choiceIndex: number) {
    this.choices(sectionIndex, questionIndex).push(this.fb.group({
      text: choiceIndex ? `Option ${choiceIndex + 1}` : 'Other', 
      image: '',
      selected: false,
      hovering: false
    }));

    setTimeout(() => {
      const id = `section_${sectionIndex}_question_${questionIndex}_choice_${this.choices(sectionIndex, questionIndex).length - 1}`;
      const ref = <HTMLInputElement>document.getElementById(id);
      ref.select();
    });

    this.theForm.markAsDirty();
  }

  addRow(sectionIndex: number, questionIndex: number, choiceIndex: number) {
    this.rows(sectionIndex, questionIndex).push(this.fb.group({
      text: `Row ${choiceIndex + 1}`,
      index: this.rows(sectionIndex, questionIndex).length,
      hovering: false
    }));

    setTimeout(() => {
      const id = `section_${sectionIndex}_question_${questionIndex}_row_${this.rows(sectionIndex, questionIndex).length - 1}`;
      const ref = <HTMLInputElement>document.getElementById(id);
      ref.select();
    });

    this.theForm.markAsDirty();
  }

  addColumn(sectionIndex: number, questionIndex: number, choiceIndex: number) {
    this.columns(sectionIndex, questionIndex).push(this.fb.group({
      text: `Column ${choiceIndex + 1}`,
      index: this.columns(sectionIndex, questionIndex).length,
      hovering: false
    }));

    setTimeout(() => {
      const id = `section_${sectionIndex}_question_${questionIndex}_column_${this.columns(sectionIndex, questionIndex).length - 1}`;
      const ref = <HTMLInputElement>document.getElementById(id);
      ref.select();
    });

    this.theForm.markAsDirty();
  }

  removeChoice(list: FormArray, choiceIndex: number) {
    list.removeAt(choiceIndex);
    this.theForm.markAsDirty();
  }

  private clamp(value, minHeight, maxHeight) : number {
    if (value + this.sidePanelHeightCorrect > maxHeight)
    {
      value = maxHeight - this.sidePanelHeightCorrect;
    }
    else if (value < minHeight)
    {
      value = minHeight;
    }
    return value;
  }

  deleteSection(sectionIndex: number) {
    if (this.sections.length == 1) return;

    this.sections.removeAt(sectionIndex);

    if (this.sections.length === sectionIndex)
    {
      setTimeout(()=> {
        // force to pause for a frame so the element exists
        sectionIndex -=1;
        this.selectedElem = document.getElementById(this.sections.at(sectionIndex).get('sectionId').value);
        this.currentQuestionIndex = -1;
        this.currentSectionIndex = sectionIndex;
        this.moveSidePanel(this.selectedElem, this.scrollCorrect);
      });
    }

    this.theForm.markAsDirty();
  }

  private duplicateAnswerChoices(data, group) {
    let newChoices = this.fb.array([]);
    for(var x = 0; x < data.answerContent.choices.length; x++) 
    {
      let currentChoice = data.answerContent.choices[x];
      newChoices.push(this.fb.group({
          text: currentChoice.text, 
          image: currentChoice.image,
          index: currentChoice.index,
          selected: false,
          hovering: false
      }));  
    }
    (<FormGroup>group.get('answerContent')).setControl('choices', newChoices);
  }

  private duplicateRowsColumns(data, group) {
    let newRows = this.fb.array([]);
    let newCols = this.fb.array([]);
    for(var x = 0; x < data.answerContent.rows.length; x++)
    {
      let currentRow = data.answerContent.rows[x];
      newRows.push(this.fb.group({ text: currentRow.text, hovering: false }));
    }
    for(var x = 0; x < data.answerContent.columns.length; x++)
    {
      let currentCol = data.answerContent.columns[x];
      newCols.push(this.fb.group({ text: currentCol.text, hovering: false }))
    }
    (<FormGroup>group.get('answerContent')).setControl('rows', newRows);
    (<FormGroup>group.get('answerContent')).setControl('columns', newCols);
  }

  private getSectionTitle(sectionIndex: number) {
    return sectionIndex === 0 ? 'Untitled form' : 'Untitled section';
  }

  private buildAnswerContent(questionType: string): FormGroup {
    if (this.isListQuestion(questionType))
    {
      return this.fb.group({
        choices: this.fb.array( [this.fb.group({ text: 'Option 1', image: '', index: 0, selected: false, hovering: false })] ),
        description: '',
        showDescription: false,
        shuffleOptionOrder: false,
        goToSection: false,
        responseValidation: false
      }); 
    }
    else if (this.isFileQuestion(questionType))
    {
      return this.fb.group({
        file: '',
        description: '',
        specificFileTypes: false,
        fileTypesAllowed: [ ],
        maximumNumberFiles: '1',
        maximumFileSize: '10 MB',
        showDescription: false
      });
    }
    else if (this.isScaleQuestion(questionType))
    {
      return this.fb.group({
        minValue: '1',
        maxValue: '5',
        minLabel: '',
        maxLabel: '',
        description: '',
        showDescription: false
      });
    }
    else if (this.isGridQuestion(questionType))
    {
      return this.fb.group({
        description: '',
        rows: this.fb.array( [this.fb.group({ text: 'Row 1', index: 0, hovering: false })] ),
        columns: this.fb.array( [this.fb.group({ text: 'Column 1', index: 0, hovering: false })] ),
        showDescription: false,
        limitColumnResponse: false,
        shuffleRowOrder: false
      });
    }
    else if (this.isDateQuestion(questionType))
    {
      return this.fb.group({
        description: '',
        includeTime: false,
        includeYear: true,
        showDescription: false
      });
    }
    else if (this.isTimeQuestion(questionType))
    {
      return this.fb.group({
        description: '',
        answerType: 'Time',
        showDescription: false,
        timeDuration: true
      });
    }
    else if (this.isLocationQuestion(questionType))
    {
      return this.fb.group({
        description: '',
        centerLat: 29.75428,
        centerLon: -95.36687,
        lat: undefined,
        lon: undefined,
        showDescription: false
      });
    }

    // default to isTextQuestion
    return this.fb.group({ 
      description: '',
      showDescription: false,
      responseValidation: false
    });
  }

  selectMapPosition(event: google.maps.MapMouseEvent, question: AbstractControl) {
    question.get('answerContent').get('lat').setValue(event.latLng.lat());
    question.get('answerContent').get('lon').setValue(event.latLng.lng());
  }

  showOption(question: AbstractControl, key: string): boolean {
    return question.get('answerContent').get(key).value;
  }

  isTextQuestion(questionType: string) {
    return questionType === 'Short Answer' || questionType === 'Paragraph';
  }

  isListQuestion(questionType: string) {
    return questionType === 'Multiple choice' || questionType === 'Checkboxes' || questionType === 'Dropdown';
  }

  isFileQuestion(questionType: string) {
    return questionType === 'File upload';
  }

  isScaleQuestion(questionType: string) {
    return questionType === 'Linear scale';
  }

  isGridQuestion(questionType: string) {
    return questionType === 'Multiple choice grid' || questionType === 'Checkbox grid';
  }

  isDateQuestion(questionType: string) {
    return questionType === 'Date';
  }

  isTimeQuestion(questionType: string) {
    return questionType === 'Time';
  }

  isLocationQuestion(questionType: string) {
    return questionType === 'Location';
  }

  getRange(low: string, high: string): number[] {
    var l = +low;
    var h = +high;
    var nums: number[] = new Array(h - l + 1);
    for (var x = 0; x <= h - l; x++) nums[x] = x + l;
    return nums;
  }

  getMapPosition(latitude: number, longitude: number) {
    return {lat:latitude, lng:longitude};
  }

}
