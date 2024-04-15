export type Page = {
  id: number;
  data: any;
  title: string | null;
  folder: number | null;
}

export type PageData = {
  id: number;
  data: any;
}

export type StateData = any;

export type PageEditor = {
  data: any;
  title: string | null
}

export type PageInfo = {
  id: number;
  title: string | null;
  folder: number | null;
}

export type Folder = {
  id: number;
  name: string | null
}

export type DBResponse<T> = {
  status: boolean;
  res?: T;
  err?: string;
}