import { AuthzGuard } from './authz.guard';
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiSecurity,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtGuard, JwtIgnoreExpirationGuard } from './jwt.guard';

export function Authz(...roles: string[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(JwtGuard, AuthzGuard),
    ApiSecurity('acl-token'),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiBadRequestResponse({ description: 'Bad Request' }),
    ApiNotFoundResponse({ description: 'Not Found Error' }),
    ApiForbiddenResponse({ description: 'Forbidden' }),
    ApiBadGatewayResponse({ description: 'Bad Gateway' }),
    ApiInternalServerErrorResponse({ description: 'Internal Server Error' }),
  );
}

export function AuthzIgnoreExpiration(...roles: string[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(JwtIgnoreExpirationGuard, AuthzGuard),
    ApiSecurity('acl-token'),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiBadRequestResponse({ description: 'Bad Request' }),
    ApiNotFoundResponse({ description: 'Not Found Error' }),
    ApiForbiddenResponse({ description: 'Forbidden' }),
    ApiBadGatewayResponse({ description: 'Bad Gateway' }),
    ApiInternalServerErrorResponse({ description: 'Internal Server Error' }),
  );
}
