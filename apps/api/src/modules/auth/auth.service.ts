import { Injectable, NotFoundException } from "@nestjs/common";
import { db } from "../../db/db";
import { users } from "../../db/schema";

@Injectable()
export class AuthService {
  async getMe() {
    const [user] = await db
      .select({
        id: users.id,
      })
      .from(users)
      .limit(1);

    if (!user) {
      throw new NotFoundException("No users found");
    }

    return user;
  }
}
