import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { EncryptionService } from 'src/encryption/encryption.service';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
  ) {}

  async create(createAccountDto: CreateAccountDto) {
    const encryptedPassword = this.encryptionService.encrypt(
      createAccountDto.openaiPassword,
    );

    return this.prisma.openAiAccount.create({
      data: {
        ...createAccountDto,
        openaiPassword: encryptedPassword,
      },
    });
  }

  async update(id: string, updateAccountDto: UpdateAccountDto) {
    const updateData = { ...updateAccountDto };

    if (updateData.openaiPassword) {
      updateData.openaiPassword = this.encryptionService.encrypt(
        updateData.openaiPassword,
      );
    }

    try {
      return await this.prisma.openAiAccount.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Account with ID ${id} not found.`);
      }
      throw error;
    }
  }

  findAll() {
    return this.prisma.openAiAccount.findMany({
      select: {
        id: true,
        friendlyName: true,
        openaiUsername: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { authTokens: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const account = await this.prisma.openAiAccount.findUnique({
      where: { id },
      select: {
        id: true,
        friendlyName: true,
        openaiUsername: true,
        proxyInfo: true,
        createdAt: true,
        updatedAt: true,
        authTokens: true,
      },
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found.`);
    }

    return account;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.openAiAccount.delete({ where: { id } });
    return { message: `Account with ID ${id} has been deleted.` };
  }
}
