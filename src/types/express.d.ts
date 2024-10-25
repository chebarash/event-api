declare namespace Express {
  export interface Request {
    user: UserType;
    admin: AdminType;
  }
}
