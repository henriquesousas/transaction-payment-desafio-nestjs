import { Result } from '../../../../../libs/core/src/common/types/types';
import { DocumentValidator } from '../../../../../libs/core/src/common/validator/document.validator';
import { Document } from '../../../../../libs/core/src/feature/user/models/document';
import { DocumentType } from '../../../../../libs/core/src/feature/user/models/document_type';

export class ValidatorStub extends DocumentValidator {
  documentType: DocumentType;
  constructor(documentType: DocumentType) {
    super();
    this.documentType = documentType;
  }
  validate(data: string): Result<Document> {
    return new Document(data, this.documentType);
  }
}
