import { ObjectId } from "mongodb";

export interface UserData {
  _id: ObjectId,
  username: string,
  piUsername: string,
  uid: string,
  roles: Array<string>,
  role: "buyer" | "seller",
  displayName: string,
  country: string,
  createdAt: Date,
  accessToken: string
}
