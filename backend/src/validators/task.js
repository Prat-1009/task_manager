import Joi from 'joi';

export const taskCreateSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().allow('').max(2000),
  status: Joi.string().valid('pending', 'in-progress', 'completed').default('pending'),
});

export const taskUpdateSchema = Joi.object({
  title: Joi.string().min(1).max(200),
  description: Joi.string().allow('').max(2000),
  status: Joi.string().valid('pending', 'in-progress', 'completed'),
}).min(1);
