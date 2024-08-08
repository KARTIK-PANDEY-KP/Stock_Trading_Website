import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Import MatProgressSpinnerModule
import { CommonModule } from '@angular/common';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Router, RouterLink } from '@angular/router';




@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe, 
    RouterLink,
    MatProgressSpinnerModule, 
    CommonModule, 
    HttpClientModule
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'] // This should be `styleUrls` in plural
})
export class SearchComponent implements OnInit {
  stockName1:any;
  error:boolean = false;
  invalidticker: boolean = false;
  contentrender: boolean = false;
  myControl = new FormControl('');
  filteredOptions: Observable<string[]> = of([]);
  isLoading = false; // Property to track loading state
  stop = true;
  // dynamicContent = '';  // Variable to control the content of the dynamic div // TODO:
  nodejs_hosted = "https://nodeserverass3.wl.r.appspot.com"
  private cancelFilteringSubject = new Subject<void>();


  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300), // Add debounceTime here, 300 ms is a common choice
      switchMap(value => this._filter(value ?? '')),
      takeUntil(this.cancelFilteringSubject)
    );
  }

  toggleStar(event: MouseEvent): void {
    const starIcon = event.target as HTMLElement;
    if (starIcon.classList.contains('bi-star-fill')) {
      starIcon.classList.replace('bi-star-fill', 'bi-star');
      starIcon.style.color = 'black';
    } else {
      starIcon.classList.replace('bi-star', 'bi-star-fill');
      starIcon.style.color = 'yellow';
    }
  }

  private _filter(value: string): Observable<string[]> {
    if (!value) {
      return of([]); // return an empty array wrapped in an Observable
    }
    this.isLoading = true; // Start loading
    this.cancelFilteringSubject = new Subject<void>(); // Reinitialize the subject to start fresh
    this.stop = true;
    const filterValue = value.toLowerCase();
    return this.http.get<string[]>(`${this.nodejs_hosted}/search?q=${filterValue}`).pipe(
      map(data => {
        this.isLoading = false; // Stop loading when data is received
        return data;
      })
    );
  }
  cancelFiltering() {
    this.cancelFilteringSubject.next();
  }

  onSubmit(event: Event) {
    event.preventDefault();  // Prevent the default form submission

    this.submitForm();
    // Implement your form submission logic here
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent) {
    const selectedOption = event.option.value;
    const trimmedOption = selectedOption.split('|')[0].trim();
  
    // Set the input field's value to the trimmed option
    this.myControl.setValue(trimmedOption);
  
    // Delay the form submission to allow the model to update
    this.submitForm();
  }
  submitForm() {
    this.isLoading = false; // Stop loading when data is received
    this.stop = false;
    this.cancelFiltering();
    // Get the value from the form control or form group
    const stockName = this.myControl.value;
    this.stockName1 = stockName;
    this.router.navigate(["/search", stockName]); // Use Router to change URL
    this.invalidticker = false;
    this.contentrender = false;
    this.error = false;

    // // this.dynamicContent = ''; // Clear the dynamic div content TODO:

    // this.http.get(`${this.nodejs_hosted}/submit/?text=${stockName}`)
    // .subscribe({
    //   next: (data: any) => {
    //     if (data.name) {
    //       // console.log(data);
    //       this.contentrender = true;
    //       // this.dynamicContent = 
    //       // Handle success scenario, maybe update dynamicContent or another property
    //     } else {
    //       // console.log(data); WORKING
    //         this.invalidticker = true;
    //       // this.dynamicContent = '<div class="container"><div class="alert alert-danger mt-5 text-center" role="alert">No data found, please enter a valid Ticker</div></div>';
    //     }
    //   },
    //   error: (error) => {
    //     console.error('Error:', error);
    //     // this.dynamicContent = "Error fetching stock information"; //TODO:
    //   }
    // });
    // Perform the submission logic, e.g., sending the data to the server
    // Use HttpClient or a service to send the data
}
  resetAutocomplete() {
    this.myControl.setValue('');
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      switchMap(value => {
        if (!value) {
          return of([]); // Return an empty array immediately if there is no value
        }
        return this._filter(value);
      })
    );
    this.isLoading = false; // Ensure loading is set to false
    this.invalidticker = false;
    this.contentrender = false;
    this.error = false;
    // this.dynamicContent = ''; // Clear the dynamic div content //TODO:
  }
}