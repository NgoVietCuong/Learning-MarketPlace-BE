import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidateIf,
} from 'class-validator';
import dayjs, { UnitType } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { AppDataSource } from '../../../ormconfig';
import { constants } from '../constants/common.constant';

export function DateAfter(
  targetDate: string = null,
  granularity: UnitType,
  setEqual = false,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'DateAfter',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [targetDate],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          let relatedValue;
          if (targetDate) {
            const [relatedPropertyName] = args.constraints;
            relatedValue = (args.object as any)[relatedPropertyName];
          } else {
            // The value must be greater than today
            relatedValue = dayjs();
          }
          if (setEqual) {
            return dayjs(value).isSameOrAfter(relatedValue, granularity);
          }
          return dayjs(value).isAfter(relatedValue, granularity);
        },
        defaultMessage() {
          if (targetDate) {
            if (setEqual) {
              return `The value of field '$property' must be greater than or equal the value of field '${targetDate}'`;
            }
            return `The value of field '$property' must be greater than the value of field '${targetDate}'`;
          } else {
            if (setEqual) {
              return `The value of field '$property' must be greater than or equal this ${granularity}`;
            }
            return `The value of field '$property' must be greater than this ${granularity}.`;
          }
        },
      },
    });
  };
}

export function IsTextAndNumber(allowNumber: boolean, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsTextAndNumber',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          let format;
          if (allowNumber) {
            // Accept text and number
            format = /^[^*|\":<>[\]{}`\\()';@&$]+$/;
          } else {
            // Accept text only
            format = /^[^*|\":<>[\]{}`\\()';@&$0-9]+$/;
          }

          return format.test(value);
        },
        defaultMessage() {
          if (allowNumber) {
            return `The value of field '$property' must be text and number.`;
          }

          return `The value of field '$property' must be text only.`;
        },
      },
    });
  };
}

export function IsDateFormat(format: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsDateFormat',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          return dayjs(value, format).format(format) == value;
        },
        defaultMessage() {
          return `The value of field '$property' must be valid date format ${format}`;
        },
      },
    });
  };
}

export function GreaterThanOrEqualTo(targetField: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'GreaterThanOrEqualTo',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [targetField],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];

          return value >= relatedValue;
        },
        defaultMessage() {
          return `The value of field '$property' must be greater than or equal to '${targetField}'`;
        },
      },
    });
  };
}

export function StringMaxWords(max: number, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'StringMaxWords',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        async validate(value: any) {
          if (!value) {
            return true;
          }
          value += '';
          let count = value.split(' ').length;

          return count <= max;
        },
        defaultMessage() {
          return `$property must have less than or equal ${max} words.`;
        },
      },
    });
  };
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!value) {
            return false;
          }
          if (value.length < constants.PASSWORD.MIN_LENGTH || value.length > constants.PASSWORD.MAX_LENGTH) {
            return false;
          }
          let format = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z]).*$/;

          return format.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          const value = args.value;
          if (!value) {
            return 'The $property is required.';
          }
          if (value.length < constants.PASSWORD.MIN_LENGTH || value.length > constants.PASSWORD.MAX_LENGTH) {
            return `The $property must be between ${constants.PASSWORD.MIN_LENGTH} and ${constants.PASSWORD.MAX_LENGTH} characters`;
          }
          return `The $property include uppercase letters, lowercase letters, numbers, and special characters.`;
        },
      },
    });
  };
}

export function IsDifferentFrom(property: string, validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'isEqualTo',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value !== relatedValue;
        },

        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${propertyName} must be different from ${relatedPropertyName}`;
        },
      },
    });
  };
}

@ValidatorConstraint({ name: 'Unique', async: false })
export class Unique implements ValidatorConstraintInterface {
  async validate(value: any, args: ValidationArguments) {
    const entity = args.constraints[0];
    const uniqueColumnName = args.constraints[1] || 'id';
    const onlyLowerCase: boolean = args.constraints[2];
    if (!entity || !value) {
      return false;
    }

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const queryBuilder = AppDataSource.getRepository(entity).createQueryBuilder();
    if (onlyLowerCase) {
      queryBuilder.where(`LOWER(REPLACE(${uniqueColumnName}, ' ', '')) = LOWER(REPLACE(:value, ' ', ''))`, {
        value: value,
      });
    } else {
      queryBuilder.where(`${uniqueColumnName} = :value`, { value: value.trim() });
    }
    const exist = await queryBuilder.getOne();

    return !exist;
  }

  defaultMessage() {
    return `$property already exist.`;
  }
}

@ValidatorConstraint({ name: 'Exist', async: false })
export class Exist implements ValidatorConstraintInterface {
  async validate(value: any, args: ValidationArguments) {
    const entity = args.constraints[0];
    const targetColumnName = args.constraints[1] || 'id';
    const withDeleted: boolean = args.constraints[2] || false;

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const queryBuilder = AppDataSource.getRepository(entity)
      .createQueryBuilder()
      .where(`${targetColumnName} = :value`, { value: value });
    if (withDeleted) {
      queryBuilder.withDeleted();
    }
    const exist = await queryBuilder.getOne();

    return !!exist;
  }

  defaultMessage() {
    return `$property not exist.`;
  }
}
