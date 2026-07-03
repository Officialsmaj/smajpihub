import { Request } from "express";
import { UserData } from "../types/user";

const getBearerToken = (authorization = "") => {
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || "";
};

export const resolveCurrentUser = async (req: Request): Promise<UserData | null> => {
  if (req.session.currentUser) return req.session.currentUser;

  const accessToken = getBearerToken(req.get("authorization")) || req.get("x-smaj-access-token") || "";
  if (!accessToken) return null;

  const userCollection = req.app.locals.userCollection;
  if (!userCollection) return null;

  const currentUser = await userCollection.findOne({ accessToken });
  if (!currentUser || currentUser.blocked) return null;

  req.session.currentUser = currentUser;
  return currentUser;
};
