import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as requestIp from 'request-ip';

// import * as moment from 'moment';
// const timeFmt = 'YYYYMMDDHHmmss';

@Injectable()
export class AppRouteLoggerMiddleware implements NestMiddleware {
  private static printLog(req: any, res: Response, diffTxt, method: string, code: string, route: string): void {
    // const timestamps = moment().format(timeFmt);
    const clientIp = req.clientIp ? req.clientIp : requestIp.getClientIp(req);

    Logger.log(
      `(${clientIp})${req.ips?.length > 0 ? 'p' : ''} ${
        req.user?.initial ? 'auth: ' + req.user.initial : 'auth: no tok'
      } - [${method}][${code}][${diffTxt}] ${route}`,
    );
  }

  use(req: Request, res: Response, next: NextFunction) {
    const route = req.originalUrl || req.url || req.path;
    const method = req.method;
    const startAt = process.hrtime();

    function onFinish() {
      // clearTimeout(timeout);

      const code = res.statusCode;
      const diff = process.hrtime(startAt);
      const time = diff[0] * 1e3 + diff[1] * 1e-6; // https://github.com/expressjs/response-time/blob/5b396e3c87420bdc5a1bd283495de54d4ded4abf/index.js#L57

      AppRouteLoggerMiddleware.printLog(req, res, `${time.toFixed(2)}ms`, method, code.toString(), route);
    }

    // const timeout = setTimeout(() => {
    //   res.off('finish', onFinish);

    //   AppRouteLoggerMiddleware.printLog(req, res, 'TIMEOUT', method, '', route);
    // }, 15 * 1000);

    // res.once('finish', onFinish);
    req.once('close', onFinish);
    next();
  }
}
