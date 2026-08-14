import Joi from 'joi'

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3001),
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().default('postgres'),
  DB_PASS: Joi.string().allow('').default('postgres'),
  DB_NAME: Joi.string().default('mcomvcard'),
  JWT_SECRET: Joi.string().default('dev-secret'),
  JWT_EXPIRES_IN: Joi.string().default('1h'),
})
