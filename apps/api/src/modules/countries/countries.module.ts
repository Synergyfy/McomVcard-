import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { Country } from './entities/country.entity'
import { CountriesService } from './countries.service'

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Country]),
  ],
  providers: [CountriesService],
  exports: [CountriesService],
})
export class CountriesModule {}
