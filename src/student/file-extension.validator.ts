import { FileValidator } from '@nestjs/common';
import { extname } from 'path';

export class FileExtensionValidator extends FileValidator<Record<string, any>> {
  constructor(validationOptions: Record<string, any>) {
    super(validationOptions);
  }

  isValid(file: Express.Multer.File): boolean {
    const allowedExtensions = ['.png', '.jpeg', '.jpg'];
    const fileExtension = extname(file.originalname).toLowerCase();
    return allowedExtensions.includes(fileExtension);
  }

  buildErrorMessage(): string {
    return 'Only .png, .jpeg, and .jpg files are allowed';
  }
}
