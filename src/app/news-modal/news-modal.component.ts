import { Component, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { HttpClient } from '@angular/common/http'; // Import HttpClient
import { HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-news-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    HttpClientModule
  ],
  providers: [BsModalService],
  templateUrl: './news-modal.component.html',
  styleUrls: ['./news-modal.component.css']
})
export class NewsModalComponent {
  showSuccessMessage = false;
  currentPrice: number = 184.23;  // This should be dynamically fetched from the backend
  moneyInWallet: number = 25000.00; // Consider fetching this from the backend
  quantityOwned: number = 0; // Consider fetching this from the backend
  quantityBuy: number = 0;
  quantitySell: number = 0;
  ticker = "AAPL";
  companyName = "Apple Inc."
  baseUrl = "https://nodeserverass3.wl.r.appspot.com";
  enoughMoney: boolean = true;
  enoughStocks: boolean = true;
  modalRef!: BsModalRef;

  constructor(
    private modalService: BsModalService,
    private http: HttpClient  // Inject HttpClient
  ) {}

  openModal(template: TemplateRef<any>) {
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
                this.showSuccessMessage = true;
                setTimeout(() => this.showSuccessMessage = false, 5000);
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
                this.showSuccessMessage = true;
                setTimeout(() => this.showSuccessMessage = false, 5000);
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

}
