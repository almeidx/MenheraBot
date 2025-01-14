import UserRepository from './UserRepository';

export default class RelationshipRepository {
  constructor(private userRepository: UserRepository) {}

  async marry(userOneID: string, userTwoID: string, data: string): Promise<void> {
    await this.userRepository.update(userOneID, {
      married: userTwoID,
      marriedDate: data,
      lastCommandAt: Date.now(),
    });
    await this.userRepository.update(userTwoID, {
      married: userOneID,
      marriedDate: data,
      lastCommandAt: Date.now(),
    });
  }

  async divorce(userOneID: string, userTwoID: string): Promise<void> {
    await this.userRepository.update(userOneID, {
      married: null,
      marriedDate: null,
      lastCommandAt: Date.now(),
    });
    await this.userRepository.update(userTwoID, {
      married: null,
      marriedDate: null,
      lastCommandAt: Date.now(),
    });
  }

  async trisal(userOneID: string, userTwoID: string, userThreeID: string): Promise<void> {
    await this.userRepository.update(userOneID, {
      trisal: [userTwoID, userThreeID],
      lastCommandAt: Date.now(),
    });
    await this.userRepository.update(userTwoID, {
      trisal: [userOneID, userThreeID],
      lastCommandAt: Date.now(),
    });
    await this.userRepository.update(userThreeID, {
      trisal: [userOneID, userTwoID],
      lastCommandAt: Date.now(),
    });
  }

  async untrisal(userOneID: string, userTwoID: string, userThreeID: string): Promise<void> {
    await this.userRepository.multiUpdate([userOneID, userTwoID, userThreeID], { trisal: [] });
  }
}
