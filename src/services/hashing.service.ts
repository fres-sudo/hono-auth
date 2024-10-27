import { Scrypt } from "oslo/password";
import { injectable } from "tsyringe";

@injectable()
export class HashingService {
  private readonly hasher = new Scrypt();
  // private readonly hasher = new Argon2id(); // argon2id hasher

  async hash(data: string) {
    return this.hasher.hash(data);
  }

  async verify(hash: string, data: string) {
    return this.hasher.verify(hash, data);
  }
}
