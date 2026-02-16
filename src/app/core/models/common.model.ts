export interface IPagedResponse<T> {
  items: T[];
  totalCount: number;
}

export interface IPagedRequest<T> {
  filter?: T;
  page: number;
  pageSize: number;
  sortModel?: ISortModel;
}

export interface ISortModel {
  field: string;
  sort: 'asc' | 'desc';
}

export interface INameCount {
  name: string;
  count: number;
}
