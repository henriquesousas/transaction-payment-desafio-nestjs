import { Body, Controller, Inject, Post } from '@nestjs/common';
import {
  CREATE_USER_USECASE_TOKEN,
  CreateUser,
} from '@app/core/feature/user/usecases/interfaces/create-user';
import { CreateUserDto } from '@app/core/feature/user/dtos/create-user.dto';
import { isError } from '@app/core/common/types/types';
import { CreateUserResponse } from './dtos/create-user-response.dto';

@Controller('/user')
export class UserController {
  constructor(
    @Inject(CREATE_USER_USECASE_TOKEN)
    private readonly usecase: CreateUser,
  ) {}

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<CreateUserResponse> {
    const userOrError = await this.usecase.execute(dto);
    if (isError(userOrError)) {
      throw userOrError;
    }
    const { id, firstName, secondName, email, amount } = userOrError;
    return {
      id,
      firstName,
      secondName,
      email,
      amount,
    };
  }
}
