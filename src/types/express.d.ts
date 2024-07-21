declare namespace Express {
  export interface Request {
    user: {
      _id: string;
      given_name: string;
      family_name: string;
      picture: string;
      email: string;
      id: number;
    } | null;
  }
}
