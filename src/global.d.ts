declare global {
  namespace Express {
    interface Request {
      roomId?: string;
      userId?: string;
    }
  }
}

export {};
