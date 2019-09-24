import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FarmgraphService {

  farm: any = {
    FitId: 306,
    Length: 2359,
    Name: null,
    NodeId: 0,
    Width: 8810,
    __type: "T4C.farm_graph.backend.Models.FarmNode",
  }

  constructor() { }

  GetFarm(): any {
    return this.farm;
  }

}
