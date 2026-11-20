import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageOffers } from './manage-offers';

describe('ManageOffers', () => {
  let component: ManageOffers;
  let fixture: ComponentFixture<ManageOffers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageOffers],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageOffers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
