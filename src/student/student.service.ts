import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { Repository } from 'typeorm';
import { CreateStudentDto } from './dto/create.student.dto';
import { UpdateStudentDto } from './dto/update.student.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}
  async createStudent(
    createStudentDto: CreateStudentDto,
  ): Promise<{ student: Student; message: string }> {
    try {
      const newStudent = this.studentRepository.create(createStudentDto);
      const savedStudent = await this.studentRepository.save(newStudent);
      return {
        student: savedStudent,
        message: 'Student created successfully',
      };
    } catch (error: any) {
      throw new Error('Error creating student: ' + error);
    }
  }
  async getAllStudents(): Promise<Student[]> {
    return this.studentRepository.find();
  }

  async getStudentById(id: number): Promise<Student> {
    const student = await this.studentRepository.findOneBy({ id });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return student;
  }
  async updateStudent(
    id: number,
    updateStudentDto: Partial<UpdateStudentDto>,
  ): Promise<{ student: Student; message: string }> {
    const student = await this.studentRepository.findOneBy({ id });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Check if a new image is being uploaded
    const isNewImageUploaded =
      updateStudentDto.image &&
      updateStudentDto.image !== student.image &&
      updateStudentDto.image.trim() !== '';

    // console.log('Update details:', {
    //   currentImage: student.image,
    //   newImage: updateStudentDto.image,
    //   isNewImageUploaded,
    // });

    // If updating with a new image, delete the old image file
    if (isNewImageUploaded && student.image) {
      try {
        const oldImagePath = join(
          process.cwd(),
          'uploads',
          'students',
          student.image,
        );
        console.log('Deleting old image:', oldImagePath);
        await unlink(oldImagePath);
        console.log('Old image deleted successfully');
      } catch (error) {
        // Log error but don't fail the update if file deletion fails
        console.warn(
          `Failed to delete old image file: ${student.image}`,
          error,
        );
      }
    }

    // If no new image is uploaded or image field is empty/null, preserve the existing image
    if (!isNewImageUploaded) {
      console.log('Preserving existing image:', student.image);
      updateStudentDto.image = student.image;
    } else {
      console.log('Using new image:', updateStudentDto.image);
    }

    const updatedStudent = this.studentRepository.merge(
      student,
      updateStudentDto,
    );
    const savedStudent = await this.studentRepository.save(updatedStudent);
    return {
      student: savedStudent,
      message: 'Student updated successfully',
    };
  }
  async deleteStudent(id: number): Promise<{ message: string }> {
    const student = await this.studentRepository.findOneBy({ id });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Delete the student record
    const result = await this.studentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Student not found');
    }

    // Delete the associated image file if it exists
    if (student.image) {
      try {
        const imagePath = join(
          process.cwd(),
          'uploads',
          'students',
          student.image,
        );
        await unlink(imagePath);
      } catch (error) {
        // Log error but don't fail the deletion if file deletion fails
        console.warn(`Failed to delete image file: ${student.image}`, error);
      }
    }

    return { message: 'Student deleted successfully' };
  }
}
