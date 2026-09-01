import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Testimonial } from './entities/testimonial.entity'
import { TestimonialsService } from './testimonials.service'

@Module({
  imports: [TypeOrmModule.forFeature([Testimonial])],
  providers: [TestimonialsService],
  exports: [TestimonialsService],
})
export class TestimonialsModule {}
