import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserResponseDto => {
    const request = ctx.switchToHttp().getRequest()

    return request.user
  },
)
