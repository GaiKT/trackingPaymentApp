import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { User } from '../models/users';

export interface JwtPayload {
  userId: string;
}

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;
  
  if (req.headers.authorization) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // Allow token in query params for file downloads
  else if (req.query.token) {
    token = req.query.token as string;
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      res.status(401);
      throw new Error('Not authorized, user not found');
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token failed' + error);
  }
});