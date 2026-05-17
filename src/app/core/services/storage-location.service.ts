import { inject, Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { IStore } from '../models/wine.model';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { IStoreInventory } from '../models/store.model';

@Injectable({ providedIn: 'root' })
export class StorageLocationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/store`;

  private readonly locations: IStore[] = [
    { id: 5, name: 'Kitchen Wine Cooler', abbreviation: 'K', color: '#b45309', rows: 15, columns: 6, hasTopBin: true, hasBottomBin: true },
    { id: 6, name: 'Den Wine Cooler', abbreviation: 'D', color: '#1d4ed8', rows: 13, columns: 6, hasTopBin: false, hasBottomBin: false },
  ];

  getAll(): Observable<IStore[]> {
    return of(this.locations);
  }

  getById(id: number): Observable<IStore | undefined> {
    return of(this.locations.find(l => l.id === id));
  }

  getInventory(storeId: number): Observable<IStoreInventory> {
    return this.http.get<IStoreInventory>(`${this.baseUrl}/${storeId}/inventory`).pipe(
      map((inventory) => ({
        ...inventory,
        color: this.locations.find(l => l.id === inventory.id)?.color ?? '#6b7280',
      })),
    );
  }
}
