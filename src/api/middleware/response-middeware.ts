import { NextFunction, Request, Response } from 'express';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const apiResponseMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const oldJson = res.json;
  res.json = function (body: object | string) {
    let apiResponse: ApiResponse<object>;
    if (res.statusCode >= 200 && res.statusCode < 300) {
      apiResponse = {
        success: true,
        data: body as object,
      };
    } else {
      apiResponse = {
        success: false,
        error: body as string,
      };
    }
    res.json = oldJson;
    return res.json(apiResponse);
  };
  next();
};
