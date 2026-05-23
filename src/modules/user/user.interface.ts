export interface IUser {
  id?: number;
  name: string;
  email: string;
  password: string;
  role?: "maintainer" | "contributor";
  created_at?: Date;
  updated_at?: Date;
}
