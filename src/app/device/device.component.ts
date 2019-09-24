import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.css']
})
export class DeviceComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
    console.log('x')
  }

  goToFarmGraph(): void {
    this.router.navigate(['/farm-graph']);
  }
}
