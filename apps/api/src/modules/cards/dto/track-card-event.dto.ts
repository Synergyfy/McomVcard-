import { ApiProperty } from '@nestjs/swagger'
import { IsIn } from 'class-validator'

export class TrackCardEventDto {
  @ApiProperty({ enum: ['view', 'scan', 'share'], description: 'The public event to record against the card' })
  @IsIn(['view', 'scan', 'share'])
  event!: 'view' | 'scan' | 'share'
}
