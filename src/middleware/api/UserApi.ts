import { UserService } from "../services/UserService";
import { UserCredentials, NewUser } from "../types";

export abstract class UserApi {
  private static userService = new UserService();

  static async login(credentials: UserCredentials) {
    return await this.userService.login(credentials);
  }

  static async register(userData: NewUser) {
    return await this.userService.register(userData);
  }

  static async logout() {
    return await this.userService.logout();
  }

  static async getCurrentUser() {
    return await this.userService.getCurrentUser();
  }

  static async resetPassword(email: string) {
    return await this.userService.resetPassword(email);
  }

  static async updatePassword(newPassword: string) {
    return await this.userService.updatePassword(newPassword);
  }

  static async resendVerificationEmail(email: string) {
    return await this.userService.resendVerificationEmail(email);
  }
}