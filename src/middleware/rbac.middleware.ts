import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { ERROR_CODES } from '../constants';

export function authorizeRoles(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        code: ERROR_CODES.UNAUTHORIZED,
        message: 'User is not authenticated',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        code: ERROR_CODES.FORBIDDEN,
        message: `Forbidden: requires one of roles [${allowedRoles.join(', ')}]`,
      });
    }

    next();
  };
}

