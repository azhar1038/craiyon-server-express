import { NextFunction, Request, Response } from 'express';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const apiResponseMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const oldJson = res.json;
  res.json = function (body: any) {
    let apiResponse: ApiResponse<any>;
    if (res.statusCode >= 200 && res.statusCode < 300) {
      apiResponse = {
        success: true,
        data: body,
      };
    } else {
      apiResponse = {
        success: false,
        error: body,
      };
    }
    res.json = oldJson;
    return res.json(apiResponse);
  };
  next();
};
