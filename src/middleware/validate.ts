import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

export const validate =
  (schema: ZodSchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: error.issues, // In newer Zod versions, .issues is sometimes preferred, but .errors is standard for ZodError
        });
      }
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };
