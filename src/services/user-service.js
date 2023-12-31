import { ObjectId } from "mongodb";
import UserModel from "../schema/user-schema.js";

export class UserService {
  constructor() {}

  async create(user) {
    await UserModel.create(user);
  }
  async findAll() {
    return await UserModel.find({});
  }
  async find(id) {
    return await UserModel.findById(new ObjectId(id));
  }

  async delete(id) {
    await UserModel.deleteOne(new ObjectId(id));
  }

  async update(id, user) {
    return await UserModel.updateOne({ _id: new ObjectId(id) }, user);
  }

  async findByEmail(email) {
    return await UserModel.findOne({ email });
  }

  async login(email, password) {
    if ((email, password)) {
      const user = await this.findByEmail(email);
      if (user) {
        const auth = user.password === password;
        if (auth) {
          return user;
        }
        return null;
      }
      return null;
    }
    return null;
  }
}
