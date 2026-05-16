import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IStore } from '../models/wine.model';

@Injectable({ providedIn: 'root' })
export class StorageLocationService {
  private readonly locations: IStore[] = [
    { id: 5, name: 'Kitchen Wine Cooler', abbreviation: 'K', color: '#b45309', rows: 8, columns: 12, hasTopBin: true, hasBottomBin: false },
    { id: 6, name: 'Den Wine Cooler', abbreviation: 'D', color: '#1d4ed8', rows: 6, columns: 10, hasTopBin: false, hasBottomBin: false },
  ];

  getAll(): Observable<IStore[]> {
    return of(this.locations);
  }

  getById(id: number): Observable<IStore | undefined> {
    return of(this.locations.find(l => l.id === id));
  }
}
