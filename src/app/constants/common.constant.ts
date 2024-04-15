import 'dotenv/config';
import { OrderBy } from '../enums/common.enum';

export const constants = {
  DATE_FORMAT: 'YYYY-MM-DD',
  DATE_FORMAT_V2: 'DD MMM YYYY',
  DATE_TIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
  TIME_FORMAT: 'HH:mm:ss',
  HOUR_FORMAT: 'h:mm A',
  PAGINATION: {
    PAGE_DEFAULT: 1,
    LIMIT_DEFAULT: 10,
    SORT_BY_DEFAULT: 'id',
    ORDER_BY_DEFAULT: OrderBy.DESC,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 64,
  },
  LIMIT_FILE: {
    SIZE: 500 * 1024 * 1024,
    TYPE: /\.(docx|doc|odt|rdt|rtf|epub|pptx|ppt|txt|odp|xlsx|csv|tsv|ods|xlsm|xlsb|xltx|png|jpg|pdf|jpeg|webp|svg|gif|avif|apng)$/,
  },
  RESET_PASSWORD_CODE: {
    LENGTH: 6,
    TTL: 600, // 10 minutes
  },
  VERIFY_SIGNUP_CODE: {
    LENGTH: 6,
    TTL: 300, // 5 minutes
  },
  ACCESS_TOKEN: {
    EXPIRES_IN: '1d',
  },
  REFRESH_TOKEN: {
    EXPIRES_IN: '30d',
    TLL: 2592000, // 30 days
  },
  ROUNDED_NUMBER: 2,
};
