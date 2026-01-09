import Joi from 'joi';

// Validation middleware factory
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errors,
        },
      });
    }

    req.body = value;
    next();
  };
};

// Block validation schemas
export const blockSchemas = {
  create: Joi.object({
    id: Joi.string().max(255),
    type: Joi.string().valid('text', 'markdown', 'code', 'image', 'drawing').required(),
    content: Joi.string().max(10000).required(),
    language: Joi.string().max(50).optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    x: Joi.number().integer().required(),
    y: Joi.number().integer().required(),
    width: Joi.number().integer().required(),
    height: Joi.number().integer().required(),
  }),

  update: Joi.object({
    content: Joi.string().max(10000).optional(),
    language: Joi.string().max(50).optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    x: Joi.number().integer().optional(),
    y: Joi.number().integer().optional(),
    width: Joi.number().integer().optional(),
    height: Joi.number().integer().optional(),
  }),
};

// Connection validation schemas
export const connectionSchemas = {
  create: Joi.object({
    id: Joi.string().max(255).optional(),
    from_block: Joi.string().max(255).required(),
    to_block: Joi.string().max(255).required(),
  }),
};
