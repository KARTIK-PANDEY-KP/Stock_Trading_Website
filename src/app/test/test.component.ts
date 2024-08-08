import { Component, OnInit } from '@angular/core';
// import * as Highcharts from 'highcharts/highstock';

import * as Highcharts from 'highcharts/highstock';
import IndicatorsCore from 'highcharts/indicators/indicators';
import VBP from 'highcharts/indicators/volume-by-price';
import Exporting from 'highcharts/modules/exporting';
import { HighchartsChartModule } from 'highcharts-angular';
import ExportingModule from 'highcharts/modules/exporting';
import HighchartsMore from 'highcharts/highcharts-more';
import Highstock from 'highcharts/modules/stock';

// Initialize modules
ExportingModule(Highcharts);
HighchartsMore(Highcharts);
Highstock(Highcharts);



// Initialize indicators and modules
IndicatorsCore(Highcharts);
VBP(Highcharts);
Exporting(Highcharts);

@Component({
  selector: 'app-your-component',
  standalone:true,
  imports:[    HighchartsChartModule // add this line
],
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  ohcl: [number, number, number, number, number][] = [];
  volume: [number, number][] = [];

  Highcharts: typeof Highcharts = Highcharts;
  groupingUnits: [string, number[]][] = [
    ['week', [1]],
    ['month', [1, 2, 3, 4, 6]]
  ];

  chartOptions: Highcharts.Options = {

    
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
  

  title: {
      text: 'AAPL Historical'
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
      offset: 0,
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
  
  constructor() {}

  ngOnInit() {
    this.loadData();
  }

  private async loadData() {
    const data = await fetch('https://demo-live-data.highcharts.com/aapl-ohlcv.json')
      .then(response => response.json());
      console.log(data);
      
    data.forEach((item: any) => {
      this.ohcl.push([item[0], item[1], item[2], item[3], item[4]]);
      this.volume.push([item[0], item[5]]);
    });
    
  
    console.log(this.ohcl);
    console.log(this.volume);


    this.chartOptions = {

    
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
    
  
    title: {
        text: 'AAPL Historical'
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
        offset: 0,
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
}

