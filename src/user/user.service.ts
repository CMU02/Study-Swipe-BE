import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findUserUuid(uuid: string, relation?: string): Promise<User> {
    const findUser = await this.usersRepository.findOne({
      where: { uuid },
      relations: relation ? [relation] : [],
    });
    if (!findUser) {
      throw new NotFoundException('해당 사용자는 없습니다.');
    }

    return findUser;
  }
}
