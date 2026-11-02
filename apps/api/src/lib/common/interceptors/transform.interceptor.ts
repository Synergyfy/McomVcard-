import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { ApiResponse } from '../../utils/api-response'

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    // Authenticated API responses must never be revalidated from the browser
    // cache. A 304 has no body, which leaves Axios/fetch consumers with an
    // empty payload and makes list pages look empty on repeat visits.
    const response = context.switchToHttp().getResponse<{ setHeader?: (name: string, value: string) => void }>()
    if (response?.setHeader) {
      response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      response.setHeader('Pragma', 'no-cache')
      response.setHeader('Expires', '0')
    }

    return next.handle().pipe(
      map((payload) => {
        if (payload instanceof ApiResponse) return payload
        if (payload === undefined) return ApiResponse.success(null)
        return ApiResponse.success(payload)
      }),
    )
  }
}
