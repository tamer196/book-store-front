import type { AuthorDto, CreateAuthorDto, GetAuthorListDto, UpdateAuthorDto } from './models';
import { RestService } from '@abp/ng.core';
import type { PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthorService {
  apiName = 'Default';

  
  get = (id: string) =>
    this.restService.request<any, AuthorDto>({
      method: 'GET',
      url: `/api/app/author/${id}`,
    },
    { apiName: this.apiName });

  getList = (input: GetAuthorListDto) =>
    this.restService.request<any, PagedResultDto<AuthorDto>>({
      method: 'GET',
      url: `/api/app/author`,
      params: { filter: input.filter, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName });

 

  constructor(private restService: RestService) {}
}
