import { Injectable } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import dayjs from 'dayjs';
import slugify from 'slugify';
import { constants } from 'src/app/constants/common.constant';

@Injectable()
export class BaseService {
  responseOk(data: any = undefined, msg: string = null): any {
    let response = {
      statusCode: 200,
      message: msg,
      data: data,
    };
    if (data === undefined) {
      delete response.data;
    }
    if (!msg) {
      delete response.message;
    }
    if (data?.statusCode && !data?.data) {
      response = data;
    }
    return response;
  }

  responseErr(code: number = 500, msg: string = 'Internal Server Error', data: any = null) {
    const res = {
      statusCode: code,
      message: msg,
    };
    if (data) {
      res['data'] = data;
    }

    throw new HttpException(res, code);
  }

  generateExpiredTime(value: number, unit: any): string {
    return dayjs().add(value, unit).format(constants.DATE_TIME_FORMAT);
  }

  generateRandomCode(length: number, characters = '0123456789'): string {
    let result = '';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

  async customPaginate<T>(
    queryBuilder: SelectQueryBuilder<T>,
    page: number = constants.PAGINATION.PAGE_DEFAULT,
    limit: number = constants.PAGINATION.LIMIT_DEFAULT,
  ) {
    page = +page;
    limit = +limit;
    const start = (page - 1) * limit;
    const result = await queryBuilder.skip(start).take(limit).getManyAndCount();
    const items = result[0];
    const totalItems = result[1];
    const totalPage = limit > 0 ? Math.ceil(totalItems / limit) : 1;

    return {
      items: items,
      meta: {
        totalItems: totalItems,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages: totalPage,
        currentPage: page,
      },
    };
  }

  async generateSlug(
    string: string,
    repository: any,
    column: string,
    options: { replacement: string; remove: RegExp; lower: boolean; strict: boolean; locale: string; trim: boolean } = {
      replacement: '-',
      remove: undefined,
      lower: true,
      strict: true,
      locale: 'v',
      trim: true,
    },
  ) {
    let slug = slugify(string, options);
    const result = await repository.createQueryBuilder('table').where(`table.${column} = :slug`, { slug }).getOne();

    if (result) slug += `${options.replacement}${Date.now()}`;
    return slug;
  }
}
