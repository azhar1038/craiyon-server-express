export enum Model {
  DALLE = 'DALLE',
}

export enum Resolution {
  RES_256x256 = '256x256',
  RES_512x512 = '512x512',
  RES_1024x1024 = '1024x1024',
}

export enum SortBy {
  LIKE = 'like',
  CREATED = 'created',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export function getEnumFromString<T extends string, E extends Record<string, T>>(
  param: string,
  enumObject: E,
): T | null {
  const validValues = Object.values(enumObject);
  if (validValues.includes(param as T)) {
    return param as T;
  }
  return null;
}
