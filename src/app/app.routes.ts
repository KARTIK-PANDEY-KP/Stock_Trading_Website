import { Routes } from '@angular/router';
import { SearchComponent } from './search/search.component';
import { SearchdetailsComponent } from './searchdetails/searchdetails.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { TestComponent } from './test/test.component';
import { NewsModalComponent } from './news-modal/news-modal.component';
export const routes: Routes = [
  { path: '', redirectTo: 'search/home', pathMatch: 'full' },
  { path: 'search/home', component: SearchComponent, pathMatch: 'full'  },
  { path: 'search/:ticker', component: SearchdetailsComponent, pathMatch: 'full'  },
  { path: 'watchlist', component: WatchlistComponent, pathMatch: 'full'},
  { path: 'portfolio', component: PortfolioComponent, pathMatch: 'full'  },
  { path: 'test', component: NewsModalComponent},
  // { path: '**', pathMatch: 'full', redirectTo: 'search/:ticker'},

];
