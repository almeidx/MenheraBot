const { Users } = require('../structures/DatabaseConnection');

module.exports = class UserRepository {
  static async findOrCreate(userID) {
    const result = await Users.findOne({ id: userID });
    if (result) return result;

    const newUser = await Users.create({ id: userID });
    return newUser;
  }

  static async delete(userID) {
    const result = await Users.findOneAndDelete({ id: userID });
    return result;
  }

  static async findByIdsArray(idsArray, args = {}) {
    const result = await Users.find({ id: { $in: idsArray }, args });
    return result;
  }
};
