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
import { ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MatTabsModule } from '@angular/material/tabs';
import { ChartModule } from 'angular-highcharts';
import { Chart } from 'angular-highcharts';
import { ViewChild, ElementRef } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ModalModule } from 'ngx-bootstrap/modal';


// import * as Highcharts from 'highcharts/highstock';

import * as Highcharts from 'highcharts/highstock';
import IndicatorsCore from 'highcharts/indicators/indicators';
import VBP from 'highcharts/indicators/volume-by-price';
import Exporting from 'highcharts/modules/exporting';
import { HighchartsChartModule } from 'highcharts-angular';
import ExportingModule from 'highcharts/modules/exporting';
import HighchartsMore from 'highcharts/highcharts-more';
import Highstock from 'highcharts/modules/stock';

import HC_exporting from 'highcharts/modules/exporting';


HC_exporting(Highcharts);


// Initialize modules
ExportingModule(Highcharts);
HighchartsMore(Highcharts);
Highstock(Highcharts);

interface Stock {
  stock_ticker: string;
  currentPrice: number;
  quantity_owned: number;
}


// Initialize indicators and modules
IndicatorsCore(Highcharts);
VBP(Highcharts);
Exporting(Highcharts);



declare var bootstrap: any;



export interface EpsData {
  actual: number;
  estimate: number;
  period: string;
  quarter: number;
  surprise: number;
  surprisePercent: number;
  symbol: string;
  year: number;
}
interface EpsDataItem {
  period: string;
  surprise: number;
  actual: number;
  estimate: number;
  // Add any other properties that might be in the object
}


interface Result {
  v: number;   // volume
  vw: number;  // volume weighted average price
  o: number;   // open price
  c: number;   // close price
  h: number;   // high price
  l: number;   // low price
  t: number;   // timestamp
  n: number;   // number of transactions
}

@Component({
  selector: 'app-searchdetails',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe, 
    ModalModule,
    RouterLink,
    MatProgressSpinnerModule, 
    CommonModule, 
    MatTabsModule,
    HttpClientModule,
    HighchartsChartModule,
    ChartModule  // Add ChartModule here
  ],
  providers: [BsModalService],
  templateUrl: './searchdetails.component.html',
  styleUrls: ['./searchdetails.component.css'] // This should be `styleUrls` in plural
})
export class SearchdetailsComponent implements OnInit {
  // DATA
  quote: any;
  market_status = 1;
  stock_status:any;
  peers: any;
  

  safeLogoUrl!: SafeUrl;
  safeLogoUrl2!: SafeUrl;

  currentDate: Date;


  generalinfo: any;
  chart!: Chart;
  baseUrl = "https://nodeserverass3.wl.r.appspot.com";
  ticker: string | null = null;
  stockName1:any;
  watchlistalert_add = 0;
  watchlistalert_remove = 0;
  error:boolean = false;
  invalidticker: boolean = false;
  contentrender: boolean = false;
  myControl = new FormControl('');
  filteredOptions: Observable<string[]> = of([]);
  isLoading = false; // Property to track loading state
  isLoading2 = true; // Property to track loading state

  stop = true;
  // dynamicContent = '';  // Variable to control the content of the dynamic div // TODO:
  nodejs_hosted = "https://nodeserverass3.wl.r.appspot.com"
  private cancelFilteringSubject = new Subject<void>();

  @ViewChild('newsModal') newsModal!: ElementRef;
  newsItems: any[] = [];
  sentimentData: any;
  selectedNewsItem: any = null;
  private apiUrl = 'https://nodeserverass3.wl.r.appspot.com/news/';
  ohcl: [number, number, number, number, number][] = [];
  volume: [number, number][] = [];

  // BUY AND SELL BUTTON FUNCTIONALITY
  showbuySuccessMessage = false;
  showsellSuccessMessage = false;

  currentPrice: number = 184.23;  // This should be dynamically fetched from the backend
  moneyInWallet: number = 25000.00; // Consider fetching this from the backend
  quantityOwned: number = 0; // Consider fetching this from the backend
  quantityBuy: number = 0;
  quantitySell: number = 0;
  companyName = "test"
  enoughMoney: boolean = true;
  enoughStocks: boolean = true;
  modalRef!: BsModalRef;;

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
        this.quantityOwned = stock.quantity_owned;
      }
      this.currentPrice = this.quote.c;

      console.log('Money in Wallet:', this.moneyInWallet);
      console.log('Current Price of stock:', this.currentPrice);
      console.log('Quantity Owned:', this.quantityOwned);
    },
    error: (error) => {
      console.error('Error fetching portfolio data:', error);
    }
  });
}



  Highcharts: typeof Highcharts = Highcharts;
  groupingUnits: [string, number[]][] = [
    ['week', [1]],
    ['month', [1, 2, 3, 4, 6]]
  ];

  chartOptions_rec: Highcharts.Options = {
    chart: {
      type: 'column',
      marginBottom: 80,
      backgroundColor: "#FAFAFA"

    },
    title: {
      text: 'Recommendation Trends',
      align: 'center'
    },
    xAxis: {
      categories: [],
      labels: {
        rotation: 0,

      }
    },
    exporting: {
      enabled: false
    },
    yAxis: {
      min: 0,
      title: {
        text: '#Analysis'
      },
      stackLabels: {
        enabled: true,
        style: {
          color: "white"
        }
      }
    },
    legend: {
      layout: 'horizontal', // Can be 'vertical' or 'horizontal'
      align: 'center', // Can be 'left', 'center', or 'right'
      verticalAlign: 'bottom', // Can be 'top', 'middle', or 'bottom'
      padding: 3, // Adjusts padding inside the legend box
      itemDistance: 20, // Adjusts distance between legend items
      itemMarginBottom: 5, // Adjust space below each legend item
      // To prevent legend from overlapping with the x-axis labels:
      y: 10, // You can push the legend up or down by setting this value
      // To add scrolling to the legend when there are many items:
      navigation: {
          arrowSize: 12
      },
      floating: false, // Set to true to allow the chart to overlap with the legend
      //       responsive: {
      },
    tooltip: {
      headerFormat: '<b>{point.x}</b><br/>',
      pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
    },
    plotOptions: {
      column: {
        stacking: 'normal',
        dataLabels: {
          enabled: true
        }
      }
    },
    credits: {
      enabled: false
    },
    series: [{
            type: 'column',

      name: 'Strong Buy',
      data: [],
      color: 'green'
    }, {
            type: 'column',

      name: 'Buy',
      data: [],
      color: '#90ed7d'
    }, {
            type: 'column',

      name: 'Hold',
      data: [],
      color: 'orange'
    }, {
            type: 'column',

      name: 'Sell',
      data: [],
      color: 'red'
    }, {
            type: 'column',

      name: 'Strong Sell',
      data: [],
      color: 'brown'
    }]
  }; // We will fill this in ngOnInit


  chartOptions_eps: Highcharts.Options = {
    chart: {
      type: 'spline',
      backgroundColor: "#FAFAFA"
    },
    title: {
      text: 'Historical EPS Surprises'
    },
    xAxis: {
    categories: ["1"]
    },
    yAxis: {
      title: {
        text: 'Quarterly EPS'
      }
    },
    tooltip: {
      shared: true,
    },
    plotOptions: {
      series: {
        label: {
          connectorAllowed: false
        },
        pointStart: 2010
      }
    },
    series: [{
      type: "spline",
      name: 'Actual',
      data: [ "1",  "1", "1", "1"],
      color: 'blue'
    }, {
      type: "spline",
      name: 'Estimate',
      data: ["1","1", "1", "1"],
      color: 'purple'
    }],
    legend: {
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'bottom'
    },
    responsive: {
      rules: [{
        condition: {
          maxWidth: 500
        },
        chartOptions: {
          legend: {
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom'
          }
        }
      }]
    }};// holds the chart options

    clearAlert(){
      this.watchlistalert_add = 0;
      this.watchlistalert_remove = 0;
    }
  getRecommendationTrends() {
    return this.http.get<any[]>(`https://nodeserverass3.wl.r.appspot.com/recom/?text=${this.ticker}`);
  }
  recchartinit(){
    this.getRecommendationTrends().subscribe((data) => {
      this.chartOptions_rec = {
        chart: {
          type: 'column',
          marginBottom: 80,
          backgroundColor: "#FAFAFA"
        },
        title: {
          text: 'Recommendation Trends',
          align: 'center'
        },
        xAxis: {
          categories: data.map(item => item.period),
          labels: {
            rotation:0
          }
        },
        exporting: {
          enabled: false
        },    
        yAxis: {
          min: 0,
          title: {
            text: '#Analysis'
          },
          stackLabels: {
            enabled: true,
            style: {
              color: "white"
            }
          }
        },
        credits: {
          enabled: false
        },
        legend: {
          layout: 'horizontal', // Can be 'vertical' or 'horizontal'
          align: 'center', // Can be 'left', 'center', or 'right'
          verticalAlign: 'bottom', // Can be 'top', 'middle', or 'bottom'
          padding: 3, // Adjusts padding inside the legend box
          itemDistance: 20, // Adjusts distance between legend items
          itemMarginBottom: 5, // Adjust space below each legend item
          // To prevent legend from overlapping with the x-axis labels:
          y: 10, // You can push the legend up or down by setting this value
          // To add scrolling to the legend when there are many items:
          navigation: {
              arrowSize: 12
          },
          floating: false, // Set to true to allow the chart to overlap with the legend
          // To adjust the legend for small screens or mobile:
          },
        tooltip: {
          headerFormat: '<b>{point.x}</b><br/>',
          pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
        },
        plotOptions: {
          column: {
            stacking: 'normal',
            dataLabels: {
              enabled: true
            }
          }
        },
        series: [{
                type: 'column',

          name: 'Strong Buy',
          data: data.map(item => item.strongBuy),
          color: 'green'
        }, {
                type: 'column',

          name: 'Buy',
          data: data.map(item => item.buy),
          color: '#90ed7d'
        }, {
                type: 'column',

          name: 'Hold',
          data: data.map(item => item.hold),
          color: 'orange'
        }, {
                type: 'column',

          name: 'Sell',
          data: data.map(item => item.sell),
          color: 'red'
        }, {
                type: 'column',

          name: 'Strong Sell',
          data: data.map(item => item.strongSell),
          color: 'brown'
        }]
      };
    });
  }
  chartOptions: Highcharts.Options = {

    chart: {
      backgroundColor: '#FAFAFA' // Or any other color you want
    },
    rangeSelector: {
      enabled: true,
      buttons: [{
          type: 'month',
          count: 1,
          text: '1m'
      }, {
          type: 'month',
          count: 3,
          text: '3m'
      }, {
          type: 'month',
          count: 6,
          text: '6m'
      }, {
          type: 'ytd',
          text: 'YTD'
      }, {
          type: 'year',
          count: 1,
          text: '1y'
      },
      {
          type: 'all',
          text: 'All'
      }],
      selected: 6 // This should correspond to the index of the 'All' button in the buttons array
  },
  legend: {
    enabled: false // This will completely remove the legend, including the box
  },
  xAxis:{
    type:'datetime'
  },

  title: {
      text: `${ this.ticker } Historical`
  },
  navigator: {
    enabled: true // Make sure the navigator is enabled
  },
  subtitle: {
      text: 'With SMA and Volume by Price technical indicators'
  },
  scrollbar: {
    enabled: true
},

  yAxis: [{
      startOnTick: false,
      endOnTick: false,
      labels: {
          align: 'right',
          x: -3
      },
      title: {
          text: 'OHLC'
      },
      height: '60%',
      lineWidth: 2,
      resize: {
          enabled: false
      },
        opposite: true // This moves the yAxis to the right side

  }, {
      labels: {
          align: 'right',
          x: -3
      },
      title: {
          text: 'Volume'
      },
      opposite: true ,// This moves the yAxis to the right side

      top: '65%',
      height: '35%',
      offset: -1,
      lineWidth: 2
  }],
  exporting: {
    enabled: false // This will disable the exporting feature and remove the button
  },
  tooltip: {
      split: true
  },

  plotOptions: {
      series: {
          dataGrouping: {
              units: this.groupingUnits
          }
      }
  },

    
    series: [{
      type: 'candlestick',
      name: 'AAPL',
      id: 'aapl',
      zIndex: 2,
      data: ["1","2", "3", "1"]
  }, {
      type: 'column',
      name: 'Volume',
      id: 'volume',
      data: [1,2, 3],
      yAxis: 1
  }, {
      type: 'vbp',
      linkedTo: 'aapl',
      params: {
          volumeSeriesID: 'volume'
      },
      dataLabels: {
          enabled: false
      },
      zoneLines: {
          enabled: false
      }
  }, {
      type: 'sma',
      linkedTo: 'aapl',
      zIndex: 1,
      marker: {
          enabled: false
      }
  }]
  };



  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, private sanitizer: DomSanitizer, private modalService: BsModalService) {
    this.currentDate = new Date();

    this.router.events.pipe(
    filter(event => event instanceof NavigationEnd)
  ).subscribe(() => {
    this.init();

  });}

  ngOnInit() {
  }
  getEpsData(): Observable<EpsData[]> {
    // Replace with the actual API endpoint
    return this.http.get<EpsData[]>(`https://nodeserverass3.wl.r.appspot.com/epsinfo/?text=${this.ticker}`);
  }
  updateChart(data: EpsDataItem[]): void {
    const categories = data.map((item: EpsDataItem) => `${item.period} <br/>Surprise: ${item.surprise.toFixed(4)}`);
    const actualData = data.map((item: EpsDataItem) => item.actual);
    const estimateData = data.map((item: EpsDataItem) => item.estimate);
    
    this.chartOptions_eps = {
      chart: {
        type: 'spline',
        backgroundColor: "#FAFAFA"
      },
      title: {
        text: 'Historical EPS Surprises'
      },
      xAxis: {
        categories: categories
      },
      yAxis: {
        title: {
          text: 'Quarterly EPS'
        }
      },
      tooltip: {
        shared: true,
      },
      plotOptions: {
        series: {
          label: {
            connectorAllowed: false
          },
          pointStart:  categories[0] ? 0 : undefined
        }
      },
      series: [{
        type: "spline",
        name: 'Actual',
        data: actualData,
        color: 'blue'
      }, {
        type: "spline",
        name: 'Estimate',
        data: estimateData,
        color: 'purple'
      }],
      legend: {
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'bottom'
      },
      exporting: {
        enabled: false
      },
      responsive: {
        rules: [{
          condition: {
            maxWidth: 500
          },
          chartOptions: {
            legend: {
              layout: 'horizontal',
              align: 'center',
              verticalAlign: 'bottom'
            }
          }
        }]
      }
    };  
  }
  
  fetchInsiderSentiment(ticker: string): Observable<any> {
    const url = `${this.baseUrl}/insider-sentiment?text=${ticker}`;
    return this.http.get(url);
  }



  init(){
    this.isLoading2 = true; // Set loading to true when starting to fetch data
    this.ticker = this.route.snapshot.paramMap.get('ticker')?.toUpperCase() || null;
    this.myControl.setValue(this.ticker);

    console.log(this.ticker);
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300), // Add debounceTime here, 300 ms is a common choice
      switchMap(value => this._filter(value ?? '')),
      takeUntil(this.cancelFilteringSubject)
    );
    this.http.get(`${this.nodejs_hosted}/submit/?text=${this.ticker}`)
    .subscribe({
      next: (data: any) => {
        if (data.name) {
          // console.log(data);
          this.generalinfo = data;
          console.log("generalinfo", this.generalinfo);
          this.safeLogoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.generalinfo.logo);
          this.safeLogoUrl2 = this.sanitizer.bypassSecurityTrustResourceUrl(this.generalinfo.weburl);
          this.checkWatchlistStatus();
          this.getQuote(this.ticker).subscribe(data => {
            this.quote = data;
            this.market_status = this.calculateMarketsloedd(this.quote.t);
            console.log("ms", this.market_status);
            if (this.quote.d >= 0) {
              this.stock_status = 1; // Set to 1 if quoteD is non-negative
            } else {
              this.stock_status = 0; // Set to 0 if quoteD is negative
            }
            this.chart = new Chart({
              chart: {
                type: 'stockchart',
                backgroundColor: '#FAFAFA' // Or any other color you want
        
              },
        
            legend: {
              enabled: false // This will hide the legend
            },
              title: {
                text:  `${this.ticker} Hourly Price Variation`
              },
              xAxis: {
                type: 'datetime',
                title: {
                  text: ''
                }
              },
              plotOptions: {
                series: {
                  marker: {
                    enabled: false // This will hide the markers on the plot line
                  }
                }
              },
              yAxis: {
                title: {
                  text: ''
                },
                opposite: true // This moves the yAxis to the right side
        
              },
              exporting:{
                enabled: false
              },
              series: [{
                type: 'line', // Add the type here
                name: `${this.ticker} Stock Price`,
                data: [],
                color: this.stock_status === 1 ? 'green' : 'red' // Set the color based on the stock status
              }]
            });
            this.fetchData();
            this.peers = this.generalinfo.peers;
            console.log("quote", this.quote);
            
          });
          this.contentrender = true;
          this.loadNews(this.ticker);
          this.loadData();
          this.recchartinit();
          this.getEpsData().subscribe(data => {
            this.updateChart(data);
          });
          this.fetchInsiderSentiment(this.ticker as string).subscribe(data => {
            this.sentimentData = data;
        }, error => {
            console.error(error);
        });
        
          // this.dynamicContent = 
          // Handle success scenario, maybe update dynamicContent or another property
        } else {
          // console.log(data); WORKING
            this.invalidticker = true;
          // this.dynamicContent = '<div class="container"><div class="alert alert-danger mt-5 text-center" role="alert">No data found, please enter a valid Ticker</div></div>';
        }
        this.isLoading2 = false; // Property to track loading state

      },
      error: (error) => {
        console.error('Error:', error);
        this.isLoading2 = true; // Property to track loading state

        // this.dynamicContent = "Error fetching stock information"; //TODO:
      }
    });
  }

  showAddAlert() {
    this.watchlistalert_add = 1;
    setTimeout(() => this.clearAlert(), 3000);  // Close alert after 3 seconds
  }

  // Function to show remove alert
  showRemoveAlert() {
    this.watchlistalert_remove = 1;
    setTimeout(() => this.clearAlert(), 3000);  // Close alert after 3 seconds
  }

  toggleStar(event: MouseEvent): void {
    // Use currentTarget to reliably get the element that has the event listener
    const starIcon = event.currentTarget as HTMLElement;
  
    if (!starIcon) {
      console.error('Star icon element not found');
      return;
    }
  
    if (starIcon.classList.contains('bi-star-fill')) {
      starIcon.classList.replace('bi-star-fill', 'bi-star');
      starIcon.style.color = 'black'; // Change color to black before async operation
      this.removeFromWatchlist(this.ticker)
        .subscribe({
          next: (response) => {
            console.log('Stock removed from watchlist', response);
            this.watchlistalert_remove = 1; // Update the alert flag after successful operation
            this.showRemoveAlert(); // Show alert after the async operation is complete
          },
          error: (error) => {
            console.error('Error removing stock from watchlist', error);
            // Optionally revert UI changes if the operation failed
            starIcon.classList.replace('bi-star', 'bi-star-fill');
            starIcon.style.color = 'yellow';
          }
        });
    } else {
      starIcon.classList.replace('bi-star', 'bi-star-fill');
      starIcon.style.color = 'yellow'; // Change color to yellow before async operation
      this.addToWatchlist(this.ticker)
        .subscribe({
          next: (response) => {
            console.log('Stock added to watchlist', response);
            this.watchlistalert_add = 1; // Update the alert flag after successful operation
            this.showAddAlert(); // Show alert after the async operation is complete
          },
          error: (error) => {
            console.error('Error adding stock to watchlist', error);
            // Optionally revert UI changes if the operation failed
            starIcon.classList.replace('bi-star-fill', 'bi-star');
            starIcon.style.color = 'black';
          }
        });
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
    this.isLoading = false; // Ensure loading is set to false
    this.invalidticker = false;
    this.contentrender = false;
    this.error = false;
    this.ticker = '';
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


fetchData() {
  if (this.ticker !== null) {
    this.getStockData(this.ticker).subscribe({
      next: (data: { results: Result[] }) => { // Assuming 'data' is the whole response object
        const seriesData = data.results.map((item: Result) => {
          return [item.t, item.c];
        });
  
        // Now, update the chart with the new series data.
        this.chart.ref$.subscribe(chart => {
          chart.series[0].setData(seriesData, true);
        });
      },
      error: (error) => {
        console.error('Error:', error);
      }
    });
  } else {
    // TODO: HA HALDELTEH EDGE CANAE AND PTHT HTNKSTATEMENTR ASD ASDWEJRJ T SFDI RN THNE SJCIDJCUNMEREEEEEEHandle the case where this.ticker is null
  }
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
    this.router.navigate(["/search/home"]); // Use Router to change URL

    
    this.isLoading = false; // Ensure loading is set to false
    this.invalidticker = false;
    this.contentrender = false;
    this.error = false;
    // this.dynamicContent = ''; // Clear the dynamic div content //TODO:
  }
  getNews(symbol: string | null): Observable<any> {
    return this.http.get(`${this.apiUrl}?symbol=${symbol}`);
  }

  loadNews(symbol: string | null): void {
    this.getNews(symbol).subscribe({
      next: (data) => {
        this.newsItems = data;
      },
      error: (e) => console.error(e)
    });
  }

  showModal(item: any): void {
    this.selectedNewsItem = item
    console.log(item);
    let modal = new bootstrap.Modal(this.newsModal.nativeElement);
    modal.show();
  }
  private async loadData() {
    const data = await fetch(`https://nodeserverass3.wl.r.appspot.com/volumechart?text=${this.ticker}`)
      .then(response => response.json());
      console.log(data);
      
    data.forEach((item: any) => {
      this.ohcl.push([item[0], item[1], item[2], item[3], item[4]]);
      this.volume.push([item[0], item[5]]);
    });
    
  
    console.log(this.ohcl);
    console.log(this.volume);


    this.chartOptions = {

      chart: {
        backgroundColor: '#FAFAFA' // Or any other color you want
      },
      rangeSelector: {
        enabled: true,
        buttons: [{
            type: 'month',
            count: 1,
            text: '1m'
        }, {
            type: 'month',
            count: 3,
            text: '3m'
        }, {
            type: 'month',
            count: 6,
            text: '6m'
        }, {
            type: 'ytd',
            text: 'YTD'
        }, {
            type: 'year',
            count: 1,
            text: '1y'
        },
        {
            type: 'all',
            text: 'All'
        }],
        buttonSpacing:5,

        selected: 6 // This should correspond to the index of the 'All' button in the buttons array
    },
    legend: {
      enabled: false // This will completely remove the legend, including the box
    },
    xAxis:{
      type:'datetime'
    },
  
    title: {
        text: `${this.ticker} Historical`
    },
    navigator: {
      enabled: true // Make sure the navigator is enabled
    },
    subtitle: {
        text: 'With SMA and Volume by Price technical indicators'
    },
    scrollbar: {
      enabled: true
  },
  
    yAxis: [{
        startOnTick: false,
        endOnTick: false,
        labels: {
            align: 'right',
            x: -3
        },
        title: {
            text: 'OHLC'
        },
        height: '60%',
        lineWidth: 2,
        resize: {
            enabled: false
        },
          opposite: true // This moves the yAxis to the right side
  
    }, {
      startOnTick: false,
      endOnTick: false,

        labels: {
            align: 'right',
            x: -3
        },
        title: {
            text: 'Volume'
        },
        opposite: true ,// This moves the yAxis to the right side
  
        top: '65%',
        height: '35%',
        offset: -1,
        lineWidth: 2
    }],
    exporting: {
      enabled: false // This will disable the exporting feature and remove the button
    },
    tooltip: {
        split: true
    },
  
    plotOptions: {
        series: {
            dataGrouping: {
                units: this.groupingUnits
            }
        }
    },
  
      
      series: [{
        type: 'candlestick',
        name: 'AAPL',
        id: 'aapl',
        zIndex: 2,
        data: this.ohcl,
    }, {
        type: 'column',
        name: 'Volume',
        id: 'volume',
        data: this.volume,
        yAxis: 1
    }, {
        type: 'vbp',
        linkedTo: 'aapl',
        params: {
            volumeSeriesID: 'volume'
        },
        dataLabels: {
            enabled: false
        },
        zoneLines: {
            enabled: false
        }
    }, {
        type: 'sma',
        linkedTo: 'aapl',
        zIndex: 1,
        marker: {
            enabled: false
        }
    }]};
  }
  encodeURIComponent(text: string): string {
    return encodeURIComponent(text);
  }
  truncateText(text: string | null | undefined, maxLength: number): string {
    // Ensure text is not null or undefined before attempting to access its properties
    if (text && text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    } else {
      return text || '';  // Return an empty string if text is null or undefined
    }
  }
  
  
  

  closeModal(): void {
    let modal = new bootstrap.Modal(this.newsModal.nativeElement);
    modal.hide();
  }
  formatUnixTimestamp(unixTimestamp: number): string {
    // Convert Unix timestamp to milliseconds
    const date = new Date(unixTimestamp * 1000);

    // Format the date
    const formattedDate = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)} ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`;
    
    return formattedDate;
  }
  calculateMarketsloedd(quoteTime: number): number {
    // Get the current time in milliseconds
    const currentTime = new Date().getTime();
  
    // Calculate the time difference in minutes
    const timeDifferenceMinutes = (currentTime/1000 - quoteTime) / (1000 * 60);
    console.log(currentTime, quoteTime, timeDifferenceMinutes);
    // Set marketsloedd based on the time difference (5 minutes)
    if (timeDifferenceMinutes > 5) {
      return 0;
    } else {
      return 1;
    }
  }
  

  // all calls rto th server
  getQuote(symbol: string | null): Observable<any> {
    if (!symbol) {
      throw new Error('Symbol cannot be null or empty');
    }
    const url = `${this.baseUrl}/quote/?text=${symbol}`;
    return this.http.get(url);
  }
  getStockData(stockName: string): Observable<any> {
    console.log(`${this.baseUrl}/stockdata/?stock_name=${stockName}`);
    return this.http.get<any>(`${this.baseUrl}/stockdata/?stock_name=${stockName}`);
  } 
  

  getCurrentDetails() {
    const date = new Date();
    const unixTimestamp = Math.floor(date.getTime() / 1000);
    const formattedDate = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)} ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`;

    return formattedDate;
  }



  // graph inits

  initializeChart() {
    this.chart = new Chart({
      chart: {
        type: 'stockchart',
        backgroundColor: '#FAFAFA' // Or any other color you want

      },

    legend: {
      enabled: false // This will hide the legend
    },
      title: {
        text: `${this.ticker} Hourly Price Variation`
      },
      xAxis: {
        type: 'datetime',
        title: {
          text: ''
        }
      },
      plotOptions: {
        series: {
          marker: {
            enabled: false // This will hide the markers on the plot line
          }
        }
      },
      yAxis: {
        title: {
          text: ''
        },
        opposite: true // This moves the yAxis to the right side

      },
      exporting:{
        enabled: false
      },
      series: [{
        type: 'line', // Add the type here
        name: `${this.ticker} Stock Price`,
        data: [],

      }]
    });
    
  }

  addToWatchlist(stock_ticker: string | null) {
    const url = `${this.baseUrl}/add-stock`;
    console.log("warchlist - ", stock_ticker, this.generalinfo.name )
    return this.http.post(url, { stock_ticker, stock_company_name: this.generalinfo.name });
  }

  removeFromWatchlist(stock_ticker: string | null) {
    const url = `${this.baseUrl}/remove-stock`;
    return this.http.delete(url, { body: { stock_ticker } });
  }
  checkWatchlistStatus(): void {
    const url = `${this.baseUrl}/fetch-stocks`;

    this.http.get<Stock[]>(url).subscribe({
      next: (allStocks) => {
        // Check if any of the stocks in the list match `ticker`
        const isInWatchlist = allStocks.some(stock => stock.stock_ticker === this.ticker);
        const starIcon = document.getElementById('star-icon') as HTMLElement;
        if (starIcon) {
          if (isInWatchlist) {
            starIcon.classList.remove('bi-star');
            starIcon.classList.add('bi-star-fill');
            starIcon.style.color = 'yellow'; // Set the color for 'in watchlist'
          } else {
            starIcon.classList.remove('bi-star-fill');
            starIcon.classList.add('bi-star');
            starIcon.style.color = 'black'; // Set the color for 'not in watchlist'
          }
        }
      },
      error: (error) => {
        console.error('Error fetching stock info:', error);
      }
    });
  }
}