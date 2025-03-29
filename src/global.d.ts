declare global {
  namespace Express {
    interface Request {
      roomId?: string;
    }
  }
}

export {};
