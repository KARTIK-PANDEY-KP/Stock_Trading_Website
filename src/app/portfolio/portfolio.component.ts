import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router'
import { TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Import MatProgressSpinnerModule


interface Stock {
  stock_ticker: string;
  stock_company_name:string;
  currentPrice: number;
  quantity_owned: number;
  stock_avg_price_per_share:number;
}

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [RouterLink,
            CommonModule,
            FormsModule,
            HttpClientModule,
            MatProgressSpinnerModule,
            ModalModule],
  providers: [BsModalService],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.css'
})  

export class PortfolioComponent implements OnInit {
  showbuySuccessMessage = false;
  showsellSuccessMessage = false;
  ticker = "AAPL";
  stocks: Stock[] = [];
  selectedStock: Stock | null = null;
  isLoading: boolean = true; // Add this line to track loading 
  portfolioNotFound: boolean = false;




  currentPrice: number = 184.23;  // This should be dynamically fetched from the backend
  moneyInWallet: number = 25000.00; // Consider fetching this from the backend
  quantityOwned: number = 0; // Consider fetching this from the backend
  quantityBuy: number = 0;
  quantitySell: number = 0;
  companyName = "test"
  enoughMoney: boolean = true;
  enoughStocks: boolean = true;
  modalRef!: BsModalRef;
  constructor(private http: HttpClient, private modalService: BsModalService) {}

  ngOnInit() {
    this.isLoading = true; // Set loading to true when starting to fetch data
    this.fetchPortfolioData2();
  }
  
  openModal(template: TemplateRef<any>) {
    this.fetchPortfolioData();
    this.modalRef = this.modalService.show(template);
  }

  calculateTotalBuy(): number {
    return this.quantityBuy * this.currentPrice;
  }

  calculateTotalSell(): number {
    return this.quantitySell * this.currentPrice;
  }

  buyStocks() {
    const totalBuy = this.calculateTotalBuy();
    console.log(`Trying to buy: ${this.quantityBuy} shares at ${this.currentPrice} each.`);
    console.log(`Total cost: ${totalBuy}, Money in Wallet: ${this.moneyInWallet}`);

    if (this.moneyInWallet >= totalBuy) {
        this.http.post('https://nodeserverass3.wl.r.appspot.com/buy', {
            ticker: this.ticker,
            companyName: this.companyName,
            qty: this.quantityBuy,
            currentStockPrice: this.currentPrice
        }).subscribe({
            next: (response: any) => {
                console.log('Buy response', response);
                // Update based on actual response if needed
                this.moneyInWallet = response.moneyInWallet;
                this.quantityOwned += this.quantityBuy; // Adjust based on actual data
                this.enoughMoney = true;
                this.modalRef.hide();
                this.showbuySuccessMessage = true;
                setTimeout(() => this.showbuySuccessMessage = false, 5000);
            },
            error: (error) => {
                console.error('Error buying stock', error);
                this.enoughMoney = false;
            }
        });
    } else {
        this.enoughMoney = false;
        console.log('Not enough money to buy the stocks.');
    }
}


sellStocks() {
    const totalSell = this.calculateTotalSell();
    if (this.quantityOwned >= this.quantitySell) {
        this.http.post('https://nodeserverass3.wl.r.appspot.com/sell', {
            ticker:this.ticker,
            qty: this.quantitySell,
            currentStockPrice: this.currentPrice
        }).subscribe({
            next: (response: any) => {
                console.log('Sell response', response);
                this.moneyInWallet = response.moneyInWallet; // Update based on actual response
                this.quantityOwned -= this.quantitySell; // You might need to adjust this based on actual data structure
                this.enoughStocks = true;
                this.modalRef.hide();
                this.showsellSuccessMessage = true;
                setTimeout(() => this.showsellSuccessMessage = false, 5000);
            },
            error: (error) => {
                console.error('Error selling stock', error);
                this.enoughStocks = false;
            }
        });
    } else {
        this.enoughStocks = false;
    }
}
fetchPortfolioData() {
  this.http.get<any>('https://nodeserverass3.wl.r.appspot.com/fetch').subscribe({
    next: (data) => {
      this.moneyInWallet = data.moneyInWallet;

      // Find the stock with the desired ticker
      const stock = data.stocks.find((s:Stock) => s.stock_ticker === this.ticker);
      console.log("hi", stock, this.ticker)

      if (stock) {
        this.currentPrice = stock.currentPrice;

        this.quantityOwned = stock.quantity_owned;
      }
      console.log('Money in Wallet:', this.moneyInWallet);
      console.log('Current Price of stock:', this.currentPrice);
      console.log('Quantity Owned:', this.quantityOwned);
    },
    error: (error) => {
      console.error('Error fetching portfolio data:', error);
    }
  });
}

fetchPortfolioData2() {
  this.http.get<any>('https://nodeserverass3.wl.r.appspot.com/fetch_big').subscribe({
    next: (data) => {
      this.moneyInWallet = data.moneyInWallet;
      this.stocks = data.stocks;

      console.log('Money in Wallet:', this.moneyInWallet);
      console.log('Stocks:', this.stocks);
      if (data.stocks && data.stocks.length === 0) {
        this.portfolioNotFound = true; // Set the flag to true to show the alert
      }

      this.isLoading = false;
    },
    error: (error) => {
      console.error('Error fetching portfolio data:', error);
      this.isLoading = false;

    }
  });
}
clearAlert(){
  this.showsellSuccessMessage = false;
  this.showbuySuccessMessage = false;
}
}
