import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchdetailsComponent } from './searchdetails.component';

describe('SearchdetailsComponent', () => {
  let component: SearchdetailsComponent;
  let fixture: ComponentFixture<SearchdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchdetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
