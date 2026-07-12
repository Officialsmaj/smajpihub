import { Request } from "express";
import { ObjectId } from "mongodb";
import { UserData } from "../types/user";
import { AuthSessionUser } from "../types/session";

const getBearerToken = (authorization = "") => {
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || "";
};

export const resolveCurrentUser = async (req: Request): Promise<UserData | null> => {
  const userCollection = req.app.locals.userCollection;
  if (!userCollection) return null;

  if (req.session.user?.userId && ObjectId.isValid(req.session.user.userId)) {
    const sessionUser = await userCollection.findOne({ _id: new ObjectId(req.session.user.userId) });
    if (!sessionUser || sessionUser.blocked) return null;
    return sessionUser;
  }

  const accessToken = getBearerToken(req.get("authorization")) || req.get("x-smaj-access-token") || "";
  if (!accessToken) return null;

  const currentUser = await userCollection.findOne({ accessToken });
  if (!currentUser || currentUser.blocked) return null;

  setSessionUser(req, currentUser);
  return currentUser;
};

export const minimalSessionUser = (user: UserData | Record<string, any>): AuthSessionUser => ({
  userId: user._id.toString(),
  piUsername: user.piUsername || user.username,
  role: ["buyer", "seller", "admin"].includes(user.role) ? user.role : "buyer",
});

export const setSessionUser = (req: Request, user: UserData | Record<string, any>) => {
  req.session.user = minimalSessionUser(user);
};
