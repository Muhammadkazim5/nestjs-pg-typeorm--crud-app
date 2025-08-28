import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create.student.dto';
import { Student } from './entities/student.entity';
import { UpdateStudentDto } from './dto/update.student.dto';
import { FileExtensionValidator } from './file-extension.validator';

@Controller('student')
export class StudentController {
  constructor(private studentService: StudentService) {}
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/students',
        filename: (req, file, cb) => {
          const randomName = uuidv4();
          const fileExtension = extname(file.originalname);
          cb(null, `${randomName}${fileExtension}`);
        },
      }),
    }),
  )
  async addStudent(
    @Body() createStudentDto: CreateStudentDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileExtensionValidator({}),
        ],
        fileIsRequired: false, // Make image optional
      }),
    )
    file: Express.Multer.File,
  ): Promise<{ student: Student; message: string }> {
    // If image is uploaded, add the filename to the DTO
    if (file) {
      createStudentDto.image = file.filename;
    }

    return this.studentService.createStudent(createStudentDto);
  }

  @Get()
  async findStudents(): Promise<Student[]> {
    return this.studentService.getAllStudents();
  }

  @Get(':id')
  async findStudentById(@Param('id') id: number): Promise<Student> {
    return this.studentService.getStudentById(id);
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/students',
        filename: (req, file, cb) => {
          const randomName = uuidv4();
          const fileExtension = extname(file.originalname);
          cb(null, `${randomName}${fileExtension}`);
        },
      }),
    }),
  )
  async editStudent(
    @Param('id') id: number,
    @Body() updateStudentDto: Partial<UpdateStudentDto>,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileExtensionValidator({}),
        ],
        fileIsRequired: false, // Make image optional
      }),
    )
    file: Express.Multer.File,
  ): Promise<{ student: Student; message: string }> {
    // Only update image if a new file is uploaded
    if (file) {
      updateStudentDto.image = file.filename;
    }
    // If no file is uploaded, the image field will not be set in updateStudentDto
    // The service will handle preserving the existing image

    return this.studentService.updateStudent(id, updateStudentDto);
  }

  @Delete(':id')
  async deleteStudent(@Param('id') id: number): Promise<{ message: string }> {
    return this.studentService.deleteStudent(id);
  }
}
