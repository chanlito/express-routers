import { RequestHandler, Router } from 'express';
import * as expressPromiseRouter from 'express-promise-router';

export function createRouter(
  routeConfig: RouteConfig[] | RouteConfigAlternative,
): Router {
  const router = expressPromiseRouter.default();

  if (Array.isArray(routeConfig)) {
    routeConfig.forEach(({ method, path, handler }) => {
      const m = method.toLowerCase();
      if (Array.isArray(handler)) {
        (router as any)[m](path, ...handler);
      } else {
        (router as any)[m](path, handler);
      }
    });
  } else {
    Object.keys(routeConfig).forEach(p => {
      const [method, path] = p.split(' ') as [RouteConfigMethod, string];
      if (!isValidHttpVerb(method)) throw new UnsupportedHttpVerbError();
      const m = method.toLowerCase();
      const handler = routeConfig[p];
      if (Array.isArray(handler)) {
        (router as any)[m](path, ...handler);
      } else {
        (router as any)[m](path, handler);
      }
    });
  }

  return router;
}

function isValidHttpVerb(value: string) {
  return ['get', 'post', 'put', 'patch', 'delete'].includes(
    value.toLowerCase(),
  );
}

class UnsupportedHttpVerbError extends Error {
  constructor() {
    super();
    this.name = 'UnsupportedHttpVerbError';
    this.message = 'The HTTP verb is not supported.';
  }
}

export interface RouteConfig {
  path: string;
  method: RouteConfigMethod;
  handler: RequestHandler | RequestHandler[];
}

export interface RouteConfigAlternative {
  [path: string]: RequestHandler | RequestHandler[];
}

type RouteConfigMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
