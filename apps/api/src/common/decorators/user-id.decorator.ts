import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export const USER_ID_HEADER = "x-user-id";

export const UserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const userId = request.headers[USER_ID_HEADER];

    return Array.isArray(userId) ? userId[0] : userId;
  },
);
