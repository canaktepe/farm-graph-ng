import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, NavigationEnd, NavigationExtras, RouterEvent } from '@angular/router';
import { Subscription } from 'rxjs';
import { FarmItem } from './farmItem';

declare var init: any;
declare var myModule: any;
declare var window: any;

@Component({
  selector: 'app-farm-graph',
  templateUrl: './farm-graph.component.html',
  styleUrls: ['./farm-graph.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class FarmGraphComponent implements OnInit {

  loaded: boolean = false;
  routerListener: Subscription;
  navigatedFarmItem :  FarmItem;

  constructor(private router: Router) {
    this.routerListener = this.router.events.subscribe((event: RouterEvent) => {
    
      if (event instanceof NavigationEnd) {

        this.navigateComponent(event);
      }
    });
  }

  ngOnInit() {

    // console.log(window);
  }

  ngAfterViewInit(): void {
    var self = this;
    myModule(function () {

      init(function () {
        self.loaded = true;
      });
    });
  }
  ngOnDestroy(): void {
    this.routerListener.unsubscribe();
  }

  navigateComponent(event: NavigationEnd): void {
    if (event.url.toString().indexOf('#fg-') === -1) return;
  
    this.navigatedFarmItem = this.gettemDataFromLocalStorage();
    let navigationExtras: NavigationExtras = {
      queryParams: {
        "type": this.navigatedFarmItem.type,
        "id": this.navigatedFarmItem.formData.NodeId
      }
    }
    this.router.navigate(['/device'], navigationExtras);
  }

  gettemDataFromLocalStorage(): FarmItem {
    var data = JSON.parse(localStorage.getItem("ngFarmItem"));
    return data;
  }
}
