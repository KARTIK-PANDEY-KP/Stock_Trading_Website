import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Import MatProgressSpinnerModule





export interface Stock {
  stock_ticker: string;
  stock_company_name: string;
  quote?: any; // Define a type for this as per your data structure
}

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [RouterLink,
    MatProgressSpinnerModule,
    CommonModule,
    HttpClientModule],
  templateUrl: './watchlist.component.html',
  styleUrl: './watchlist.component.css'
})
export class WatchlistComponent implements OnInit {
  watchlist: Stock[] = [];
  baseUrl = "https://nodeserverass3.wl.r.appspot.com";
  stock_status:number = 0;
  isLoading: boolean = true;  // Added loading state flag
  Watchlist_empty: boolean = false;
  errorMessage: string = '';




  constructor(private http: HttpClient) {}
  
  ngOnInit(): void {
    this.fetchStocks().subscribe(stocks => {
      this.watchlist = stocks;
      this.watchlist.forEach((stock, index) => {
        this.getQuote(stock.stock_ticker).subscribe(quote => {
          stock.quote = quote;
          this.stock_status = quote.d >= 0 ? 1 : 0; // Set stock status based on daily change
          if (index === this.watchlist.length - 1) {
            this.isLoading = false; // Set loading to false when the last stock quote is fetched
          }
        });
      });
      if (this.watchlist.length === 0) {
        this.Watchlist_empty = true;
        this.isLoading = false;
    };
  })}

    fetchStocks(): Observable<Stock[]> {
    const url = `${this.baseUrl}/fetch-stocks`;
    return this.http.get<Stock[]>(url);
  }

  getQuote(symbol: string): Observable<any> {
    if (!symbol) {
      throw new Error('Symbol cannot be null or empty');
    }
    const url = `${this.baseUrl}/quote/?text=${symbol}`;
    return this.http.get(url);
  }
  removeFromWatchlist(stock_ticker: string, index: number): void {
    const url = `${this.baseUrl}/remove-stock`;
    this.http.delete(url, { body: { stock_ticker } }).subscribe({
      next: () => {
        // Remove the stock from the local array if the backend confirms removal
        this.watchlist.splice(index, 1);
      },
      error: (error) => {
        console.error('Error removing stock', error);
        // Handle any errors here, such as displaying a message to the user
      }
    });
  }
}
