import { SetMetadata } from "@nestjs/common";
import { Roles } from "../enums/common.enum";

export const ACCESS_ROLES_KEY = 'roles';
export const AllowAccess = (...roles: Roles[]) => SetMetadata(ACCESS_ROLES_KEY, roles)