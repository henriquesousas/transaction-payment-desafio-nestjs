import { Document } from '../../../@shared/document';
import { Entity } from '../../../@shared/entity';
import { Flunt } from '../../../@shared/validator/flunt';
import { Uuid } from '../../../@shared/value-object/uuid';
import { CustomerValidator } from '../customer.validator';
import { InsuficientBalanceException } from '../exception/insuficient-balance.exception';
import { TrasferenceNotAllowed } from '../exception/transference-not-allowed.exception';
import { Email } from '../value-object/email';
import { Password } from '../value-object/password';
import { Wallet } from './wallet';

export class CustomerId extends Uuid {}

export enum DocumentType {
  CPF = 'CPF',
  CNPJ = 'CNPJ',
}

export type CustomerProps = {
  customerId?: CustomerId;
  firstName: string;
  surName: string;
  email: Email;
  password: Password;
  document: Document;
  wallet?: Wallet;
  isActive?: boolean;
  createdAt?: Date;
};

export abstract class Customer extends Entity {
  private props: CustomerProps;
  protected abstract documentType: DocumentType;
  protected abstract canTransfer: boolean;

  constructor(props: CustomerProps) {
    super();
    this.props = {
      ...props,
      customerId: props.customerId ?? new CustomerId(),
      wallet: props.wallet ?? new Wallet(),
      isActive: props.isActive ?? true,
      createdAt: props.createdAt ?? new Date(),
    };
  }

  get entityId(): Uuid {
    return this.props.customerId!;
  }

  get document(): Document {
    return this.props.document;
  }

  get wallet(): Wallet {
    return this.props.wallet!;
  }

  get firstName(): string {
    return this.props.firstName;
  }

  get surName(): string {
    return this.props.surName;
  }

  get email(): string {
    return this.props.email.value;
  }

  get password(): string {
    return this.props.password.value;
  }

  get createdAt(): Date {
    return this.props.createdAt!;
  }

  get isActive(): boolean {
    return this.props.isActive!;
  }

  changeFirstName(name: string): void {
    this.props.firstName = name;
    this.validate(['firstName']);
  }

  changeSurName(surName: string): void {
    this.props.surName = surName;
    this.validate(['surName']);
  }

  transfer(receiver: Customer, value: number): void {
    if (!this.canTransfer) {
      throw new TrasferenceNotAllowed();
    }
    if (this.wallet.balance < value) {
      throw new InsuficientBalanceException();
    }
    this.wallet.debit(value);
    receiver.wallet.credit(value);
  }

  private validate(fields: string[]): boolean {
    const validator = new CustomerValidator();
    return validator.validate(this.notification, this, fields);
  }
}
