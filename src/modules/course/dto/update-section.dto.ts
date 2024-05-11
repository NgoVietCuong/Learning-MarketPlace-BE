import { PickType } from "@nestjs/swagger";
import { CreateSectionDto } from "./create-section.dto";

export class UpdateSectionDto extends PickType(CreateSectionDto, ['title'] as const) {}
