import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProfileContent, User } from '@prisma/client';

import { PrismaService } from 'src/prisma.service';
import { FsService } from 'src/fs/fs.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private fsService: FsService,
  ) {}

  async addProfileContent(
    userId: string,
    content: Prisma.ProfileContentCreateInput,
  ): Promise<ProfileContent> {
    const profileContent = await this.prisma.profileContent.create({
      data: { ...content, user: { connect: { id: userId } } },
    });
    return profileContent;
  }

  /**
   * Find all celebrities
   * @returns array of celebrities
   */
  async findAllCelebrities() {
    const celebrities = await this.prisma.user.findMany({
      where: { role: 'celebrity' },
      include: {
        profileContents: true,
      },
    });
    return celebrities;
  }

  async findOneById(userId: string) {
    const user = this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profileContents: true,
      },
    });

    return user;
  }

  async findOneByEmail(email: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });
    return user;
  }

  async updateProfile(userId: string, updateUserDto: Prisma.UserUpdateInput) {
    const OldUser = await this.findOneById(userId);
    if (!OldUser) throw new NotFoundException(`User not found`);

    // Delete old avatar of user if avatar is provided
    if (OldUser?.avatar) {
      await this.fsService.deleteFile(OldUser.avatar);
    }

    // Update user  info with new data
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
    });
    delete user.password;
    delete user.createdAt;
    return user;
  }

  // Exclude keys from user
  exclude(user: User, ...keys: string[]) {
    for (let key of keys) {
      delete user[key];
    }
    return user;
  }
}
