import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PersonalityQuiz } from './personality-quiz';

describe('PersonalityQuiz', () => {
  let component: PersonalityQuiz;
  let fixture: ComponentFixture<PersonalityQuiz>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalityQuiz],
    }).compileComponents();

    fixture = TestBed.createComponent(PersonalityQuiz);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
