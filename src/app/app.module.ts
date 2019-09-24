import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FarmGraphComponent } from './farm-graph/farm-graph.component';
import { Route, RouterModule } from '@angular/router';
import { DeviceComponent } from './device/device.component';

const routes: Route[] = [
   { path: 'farm-graph', component: FarmGraphComponent },
   { path: 'device', component: DeviceComponent },
   {
      path: '',
      redirectTo: '/farm-graph',
      pathMatch: 'full'
   },
   { path: '**', component: FarmGraphComponent }
]

@NgModule({
   declarations: [
      AppComponent,
      FarmGraphComponent,
      DeviceComponent
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
