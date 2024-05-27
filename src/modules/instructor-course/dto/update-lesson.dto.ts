import { IsString, IsNotEmpty, IsEnum } from "class-validator";
import { RequiredIf } from "src/app/decorators/custom-validator";
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

  @IsString()
  @IsNotEmpty()
  @RequiredIf((obj: UpdateLessonDto) => [VIDEO, DOCUMENT].includes(obj.contentType))
  fileName: string;
}
