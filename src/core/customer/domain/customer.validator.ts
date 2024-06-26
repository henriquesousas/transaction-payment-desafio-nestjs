import { MaxLength } from 'class-validator';
import { Notification } from '../../@shared/validator/notification';
import { Customer } from './entity/customer';
import { ClassValidatorFields } from '../../@shared/validator/class-validator-fields';

export class CustomerRules {
  @MaxLength(255, { groups: ['firstName'] })
  firstName: string;

  constructor(entity: Customer) {
    Object.assign(this, entity);
  }
}

export class CustomerValidator extends ClassValidatorFields {
  validate(notification: Notification, data: any, fields?: string[]): boolean {
    const newFields = fields?.length ? fields : ['firstName'];
    return super.validate(notification, new CustomerRules(data), newFields);
  }
}