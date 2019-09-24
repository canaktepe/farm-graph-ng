import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FarmGraphComponent } from './farm-graph/farm-graph.component';
import { Route, RouterModule } from '@angular/router';


const routes: Route[] = [
   { path: '', redirectTo: 'farm-graph',pathMatch:'full' },
   { path: 'farm-graph', component: FarmGraphComponent }
]

@NgModule({
   declarations: [
      AppComponent,
      FarmGraphComponent
   ],
   imports: [
      RouterModule.forRoot(routes),
      BrowserModule
   ],
   providers: [],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
