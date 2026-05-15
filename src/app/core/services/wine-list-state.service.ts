import { Injectable } from '@angular/core';
import { WineFilter } from '../models/wine.model';
import { ISortModel } from '../models/common.model';

@Injectable({ providedIn: 'root' })
export class WineListStateService {
  filter: WineFilter | undefined = undefined;
  page = 0;
  pageSize = 10;
  sortModel: ISortModel | undefined = undefined;
}
