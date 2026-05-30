import { Controller, Get } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("me")
  getMe(): Promise<{ id: string }> {
    return this.authService.getMe();
  }
}
