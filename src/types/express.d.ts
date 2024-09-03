declare namespace Express {
  export interface Request {
    user: {
      _id: ObjectId;
      given_name: string;
      family_name: string;
      picture: string;
      email: string;
      id: number;
      organizer: boolean;
    } | null;
  }
}
