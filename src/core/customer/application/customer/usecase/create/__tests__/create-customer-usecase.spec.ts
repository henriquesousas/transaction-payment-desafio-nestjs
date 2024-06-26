import { faker } from '@faker-js/faker';
import { CustomerRepository } from '../../../../../domain/customer.repository';
import { DocumentType } from '../../../../../domain/entity/customer';
import { CreateCustomerDto } from '../create-customer.dto';
import { CreateCustomerUseCase } from '../create-customer.usecase';
import { CustomerRegular } from '../../../../../domain/entity/customer-regular';
import { Cpf } from '../../../../../domain/value-object/cpf';
import { CustomerAlreadyExistException } from '../../../../../domain/exception/customer-already-exist.exception';
import { UnitOfWork } from '../../../../../../@shared/db/unit-of-work';
import { CustomerRepositoryStub } from '../../../../../infrastructure/db/sequelize/__tests__/mocks/customer-repository.stub';

export class UnitOfWorkStub implements UnitOfWork {
  async start(): Promise<void> {
    return;
  }
  async commit(): Promise<void> {
    return;
  }
  async rollback(): Promise<void> {
    return;
  }
  getTransaction() {
    return;
  }
  do<T>(workFn: (uow: UnitOfWork) => Promise<T>): Promise<T> {
    return workFn(this);
  }
}

type sutTypes = {
  sut: CreateCustomerUseCase;
  uow: UnitOfWork;
  repository: CustomerRepository;
};

const makeCreateCustomerDto = (
  documentType: DocumentType = DocumentType.CPF,
  documentValue: string = '12345678901',
): CreateCustomerDto => {
  return {
    firstName: faker.person.firstName(),
    surName: faker.person.lastName(),
    email: faker.internet.email(),
    password: '1234567890',
    document: documentValue,
    documentType,
    amount: 0,
  };
};

const makeSut = (): sutTypes => {
  const repository = new CustomerRepositoryStub();
  const uow = new UnitOfWorkStub();
  const sut = new CreateCustomerUseCase(repository, uow);
  return {
    sut,
    uow,
    repository,
  };
};

const mockImplementationFindByEmail = (
  repository: CustomerRepository,
): void => {
  jest
    .spyOn(repository, 'findByEmail')
    .mockImplementationOnce(() => Promise.resolve(null));
};

describe('CreateCustomerUseCase Unit Tests', () => {
  it('should create a new customer', async () => {
    const { sut, repository } = makeSut();
    const dto = makeCreateCustomerDto();

    mockImplementationFindByEmail(repository);

    const result = await sut.execute(dto);

    expect(result.isOk()).toBe(true);
    const customer = result.ok;
    expect(customer).toBeInstanceOf(CustomerRegular);
    expect(customer.email).toEqual(dto.email);
    expect(customer.password).toEqual(dto.password);
    expect(customer.document).toBeInstanceOf(Cpf);
    expect(customer.document.value).toEqual(dto.document);
    expect(customer.document.documentType).toEqual(dto.documentType);
  });

  it('should return CustomerAlreadyExistException when customer already registered', async () => {
    const { sut } = makeSut();
    const result = await sut.execute(makeCreateCustomerDto());
    expect(result.isFail()).toBe(true);
    expect(result.error).toBeInstanceOf(CustomerAlreadyExistException);
    expect(result.error.message).toBe('Cliente já cadastro em nosso sistema');
  });

  it('should call repository', async () => {
    const { sut, repository, uow } = makeSut();
    const dto = makeCreateCustomerDto();
    mockImplementationFindByEmail(repository);
    const spyInsert = jest.spyOn(repository, 'insert');
    const spyUow = jest.spyOn(repository, 'insert');
    await sut.execute(dto);
    expect(spyInsert).toHaveBeenCalledTimes(1);
    expect(spyUow).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if repository throws', async () => {
    const { sut, repository } = makeSut();
    mockImplementationFindByEmail(repository);
    jest.spyOn(repository, 'insert').mockImplementationOnce(() => {
      throw new Error();
    });
    const promise = sut.execute(makeCreateCustomerDto());
    expect(promise).rejects.toThrow();
  });
});
