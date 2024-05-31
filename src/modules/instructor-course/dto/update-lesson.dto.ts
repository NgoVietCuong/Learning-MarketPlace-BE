import { IsString, IsNotEmpty, IsEnum, IsNumber, ValidateIf } from "class-validator";
import { CreateLessonDto } from "./create-lesson.dto";
import { LessonContentType } from "src/app/enums/common.enum";
const { VIDEO, DOCUMENT } = LessonContentType;

export class UpdateLessonDto extends CreateLessonDto {
  @IsNotEmpty()
  @IsEnum(LessonContentType)
  contentType: LessonContentType;

  @IsString()
  @IsNotEmpty()
  content: string;

  @ValidateIf((obj: UpdateLessonDto) => [VIDEO, DOCUMENT].includes(obj.contentType))
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ValidateIf((obj: UpdateLessonDto) => obj.contentType === VIDEO)
  @IsNumber()
  @IsNotEmpty()
  duration: number;
}
