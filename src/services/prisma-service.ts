import { PrismaClient } from '@prisma/client';

export class PrismaService {
  private static _instance: PrismaService;
  public readonly client: PrismaClient;
  private constructor() {
    this.client = new PrismaClient();
    PrismaService._instance = this;
  }

  public static get instance() {
    return PrismaService._instance || new this();
  }
}
