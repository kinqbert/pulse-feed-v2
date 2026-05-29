import 'dotenv/config';
import Joi from 'joi';

const envSchema = Joi.object({
  PORT: Joi.number().default(3000),
  CLIENT_URL: Joi.string().required(),
  DATABASE_URL: Joi.string().required(),
})
  .unknown()
  .required();

interface EnvVars {
  PORT: number;
  CLIENT_URL: string;
  DATABASE_URL: string;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

const envVars = value as EnvVars;

export const CONFIG = {
  PORT: envVars.PORT || 3000,
  CLIENT_URL: envVars.CLIENT_URL,
  DATABASE_URL: envVars.DATABASE_URL,
};
