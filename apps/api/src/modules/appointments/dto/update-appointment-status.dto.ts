import { IsIn } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateAppointmentStatusDto {
  @ApiProperty({ example: 'confirmed', description: 'New appointment status', enum: ['pending', 'confirmed', 'cancelled', 'completed'] })
  @IsIn(['pending', 'confirmed', 'cancelled', 'completed'])
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
}