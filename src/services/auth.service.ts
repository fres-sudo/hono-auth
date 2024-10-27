import { inject, injectable } from "tsyringe";
import { BadRequest, InternalError } from "../common/error";
import { HTTPException } from "hono/http-exception";
import { HashingService } from "./hashing.service";
import { LoginDTO } from "../dtos/login.dto";
import { SignUpDTO } from "../dtos/signup.dto";
import { UsersRepository } from "../repositories/user.repository";

@injectable()
export class AuthService {
  constructor(
    @inject(HashingService) private readonly hashingService: HashingService,
    @inject(UsersRepository) private readonly usersRepository: UsersRepository,
  ) {}

  async login(data: LoginDTO) {
    try {
      const user = await this.usersRepository.findOneByEmail(data.email);
      if (!user) {
        throw BadRequest("invalid-email");
      }
      const hashedPassword = await this.hashingService.verify(
        user.password,
        data.password,
      );

      if (!hashedPassword) {
        throw BadRequest("wrong-password");
      }

      return user;
    } catch (e) {
      if (e instanceof HTTPException) {
        throw e;
      }
      throw InternalError("error-login");
    }
  }

  async signup(data: SignUpDTO) {
    try {
      const existingEmail = await this.usersRepository.findOneByEmail(
        data.email,
      );
      if (existingEmail) {
        throw BadRequest("email-already-in-use");
      }
      const hashedPassword = await this.hashingService.hash(data.password);
      data.password = hashedPassword;

      const newUser = await this.usersRepository.create(data);

      return newUser;
    } catch (e) {
      console.log({ e });
      if (e instanceof HTTPException) {
        throw e;
      }
      throw InternalError("error-signup");
    }
  }
}
