import { ISortModel } from './common.model';

export interface WineFilter {
  id?: number;
  varietal?: string;
  vineyard?: string;
  showAll?: boolean;
}

export interface NewWineRequest {
  varietal: string;
  vineyard: string;
  label: string;
  vintage: number;
  notes: string;
}

export interface Wine extends NewWineRequest {
  id: number;
  count: number;
}

export interface PatchWineRequest {
  varietal?: string;
  vineyard?: string;
  label?: string;
  vintage?: number;
  notes?: string;
}

export interface NewBottleRequest {
  wineId: number;
  storageId: number;
  binX: number;
  binY: number;
  depth: number;
}

export interface Bottle extends NewBottleRequest {
  id: number;
  storageDescription?: string;
  createdDate: Date;
}

export interface PatchBottleRequest {
  wineId?: number;
  storageId?: number;
  binX?: number;
  binY?: number;
  depth?: number;
  consumed?: boolean;
}

export interface GetWinesOptions {
  page: number;
  pageSize: number;
  sortModel?: ISortModel;
  filter?: WineFilter;
}

export interface IStoreLocation {
  id: number;
  binX: number;
  binY: number;
  count: number;
}

export interface IStoreBottle {
  bottleId: number;
  wineId: number;
  vineyard: string;
  label: string;
  varietal: string;
  vintage: number;
  binX: number;
  binY: number;
  depth: number;
  createdDate: Date;
}
