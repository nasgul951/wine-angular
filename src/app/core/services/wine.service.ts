import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IPagedResponse, INameCount } from '../models/common.model';
import {
  Wine, Bottle, NewWineRequest, PatchWineRequest,
  NewBottleRequest, PatchBottleRequest,
  GetWinesOptions, IStoreLocation, IStoreBottle,
} from '../models/wine.model';

@Injectable({ providedIn: 'root' })
export class WineService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/wine`;

  getVarietals(): Observable<INameCount[]> {
    return this.http.get<INameCount[]>(`${this.baseUrl}/varietals`);
  }

  getVineyards(like?: string): Observable<INameCount[]> {
    let params = new HttpParams();
    if (like) params = params.set('like', like);
    return this.http.get<INameCount[]>(`${this.baseUrl}/vineyards`, { params });
  }

  getWineById(wineId: number): Observable<Wine> {
    return this.http.get<Wine>(`${this.baseUrl}/${wineId}`);
  }

  getWines(opt: GetWinesOptions): Observable<IPagedResponse<Wine>> {
    let params = new HttpParams()
      .set('page', opt.page.toString())
      .set('pageSize', opt.pageSize.toString());

    if (opt.sortModel?.field) {
      params = params
        .set('sortField', opt.sortModel.field)
        .set('sortDirection', opt.sortModel.sort);
    }

    if (opt.filter) {
      for (const [key, value] of Object.entries(opt.filter)) {
        if (value !== undefined && value !== null) {
          params = params.set(key, value);
        }
      }
    }

    return this.http.get<IPagedResponse<Wine>>(`${this.baseUrl}/query`, { params });
  }

  getBottlesByWineId(wineId: number): Observable<Bottle[]> {
    return this.http.get<Bottle[]>(`${this.baseUrl}/${wineId}/bottles`);
  }

  addWine(req: NewWineRequest): Observable<Wine> {
    return this.http.post<Wine>(this.baseUrl, req);
  }

  patchWine(wineId: number, req: PatchWineRequest): Observable<Wine> {
    return this.http.patch<Wine>(`${this.baseUrl}/${wineId}`, req);
  }

  addBottle(req: NewBottleRequest): Observable<Bottle> {
    return this.http.post<Bottle>(`${this.baseUrl}/bottles`, req);
  }

  patchBottle(bottleId: number, req: PatchBottleRequest): Observable<Bottle> {
    return this.http.patch<Bottle>(`${this.baseUrl}/bottles/${bottleId}`, req);
  }

  getStoreInventory(storeId: number): Observable<IStoreLocation[]> {
    return this.http.get<IStoreLocation[]>(`${this.baseUrl}/store/${storeId}`);
  }

  getBottlesByBinId(binId: number): Observable<IStoreBottle[]> {
    return this.http.get<IStoreBottle[]>(`${this.baseUrl}/store/bin/${binId}`);
  }
}
