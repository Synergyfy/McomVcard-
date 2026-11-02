import { IsBoolean, IsIn, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateAppointmentStatusDto {
  @ApiProperty({ example: 'confirmed', description: 'New appointment status', enum: ['pending', 'confirmed', 'cancelled', 'completed'] })
  @IsIn(['pending', 'confirmed', 'cancelled', 'completed'])
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'

  @ApiPropertyOptional({ example: true, description: 'Update whether the appointment is marked as paid' })
  @IsOptional()
  @IsBoolean({ message: 'is_paid must be a boolean' })
  is_paid?: boolean
}