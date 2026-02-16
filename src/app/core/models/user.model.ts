export interface User {
  id: number;
  username: string;
  lastOn: Date;
  isAdmin: boolean;
}

export interface UpdateUserRequest {
  username?: string;
  password?: string;
  isAdmin?: boolean;
}

export interface UserFilter {
  username?: string;
}
