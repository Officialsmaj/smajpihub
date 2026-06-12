import { ObjectId } from "mongodb";

export interface UserData {
  _id: ObjectId,
  username: string,
  piUsername: string,
  uid: string,
  roles: Array<string>,
  role: "buyer" | "seller" | "admin",
  displayName: string,
  country: string,
  contactPhone?: string,
  avatar?: string,
  blocked?: boolean,
  verificationLevel?: "basic" | "verified" | "trusted_seller",
  verificationRequested?: boolean,
  settings?: {
    theme: "dark" | "light",
    language: string,
    notifications: boolean,
  },
  createdAt: Date,
  accessToken: string
}
