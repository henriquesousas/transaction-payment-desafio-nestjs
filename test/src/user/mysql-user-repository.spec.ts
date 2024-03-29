import { MysqlUserRepository } from '../../../src/user/mysql-user.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserModel } from '../../../libs/core/src/feature/user/models/user.model';
import { UserRepository } from '../../../libs/core/src/feature/user/user.repository';
import { Repository } from 'typeorm';
import { userModelMock } from '../../libs/core/user/mocks/user-model.mock';
import { throwError } from '../../test.helper';

const createTestingModule = async (): Promise<TestingModule> => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      MysqlUserRepository,
      {
        provide: getRepositoryToken(UserModel),
        useValue: {
          save: jest.fn(),
          findOne: jest.fn(),
        },
      },
    ],
  }).compile();
  return module;
};

type SutTypes = {
  sut: UserRepository;
  typeOrmRepository: Repository<UserModel>;
};

const makeSut = (module: TestingModule): SutTypes => {
  const sut = module.get<UserRepository>(MysqlUserRepository);
  const typeOrmRepository = module.get<Repository<UserModel>>(
    getRepositoryToken(UserModel),
  );
  return {
    sut,
    typeOrmRepository,
  };
};

describe('MysqlUserRepository', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await createTestingModule();
    //jest.spyOn(global, 'Date').mockReturnValue(datetimeGlobalMock() as any);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const { sut, typeOrmRepository } = makeSut(module);
      jest.spyOn(typeOrmRepository, 'save').mockResolvedValue(userModelMock);
      const userModel = await sut.create(userModelMock);
      expect(userModel).toBe(userModelMock);
    });

    it('should throw exception if typeOrm throw', async () => {
      const { sut, typeOrmRepository } = makeSut(module);
      jest.spyOn(typeOrmRepository, 'save').mockImplementationOnce(throwError);
      const promise = sut.create(userModelMock);
      await expect(promise).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      const { sut, typeOrmRepository } = makeSut(module);
      jest.spyOn(typeOrmRepository, 'findOne').mockResolvedValue(userModelMock);
      const userModel = await sut.findById('any_id');
      expect(userModel).toBe(userModelMock);
    });

    it('should return empty if user not found', async () => {
      const { sut, typeOrmRepository } = makeSut(module);
      jest.spyOn(typeOrmRepository, 'findOne').mockResolvedValue(undefined);
      const user = await sut.findById('any_id');
      expect(user).toBeFalsy();
    });

    it('should throw exception if any error', async () => {
      const { sut, typeOrmRepository } = makeSut(module);
      jest
        .spyOn(typeOrmRepository, 'findOne')
        .mockImplementationOnce(throwError);
      const promise = sut.findById('any_id');
      await expect(promise).rejects.toThrow();
    });
  });

  describe('findByDocumentOrEmail', () => {
    it('should find a user by document', async () => {
      const { sut, typeOrmRepository } = makeSut(module);
      jest.spyOn(typeOrmRepository, 'findOne').mockResolvedValue(userModelMock);
      const userModel = await sut.findByDocumentOrEmail('any_doc', 'any_email');
      expect(userModel).toBe(userModelMock);
    });

    it('should return empty if user not found', async () => {
      const { sut, typeOrmRepository } = makeSut(module);
      jest.spyOn(typeOrmRepository, 'findOne').mockResolvedValue(undefined);
      const userModel = await sut.findByDocumentOrEmail('any_doc', 'any_email');
      expect(userModel).toBeFalsy();
    });

    it('should throw exception if any error', async () => {
      const { sut, typeOrmRepository } = makeSut(module);
      jest
        .spyOn(typeOrmRepository, 'findOne')
        .mockImplementationOnce(throwError);
      const promise = sut.findByDocumentOrEmail('any_doc', 'any_email');
      await expect(promise).rejects.toThrow();
    });
  });
});
