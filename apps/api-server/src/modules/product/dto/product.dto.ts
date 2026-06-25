import {
  CreateCategorySchema,
  CreateProductSchema,
  QueryProductsSchema,
  UpdateCategorySchema,
  UpdateProductSchema
} from '@shop-saas/schemas'
import { createZodDto } from 'nestjs-zod'

export class QueryProductDto extends createZodDto(QueryProductsSchema) {}

export class CreateProductDto extends createZodDto(CreateProductSchema) {}

export class UpdateProductDto extends createZodDto(UpdateProductSchema) {}

export class CreateProductCategoryDto extends createZodDto(CreateCategorySchema) {}

export class UpdateProductCategoryDto extends createZodDto(UpdateCategorySchema) {}
