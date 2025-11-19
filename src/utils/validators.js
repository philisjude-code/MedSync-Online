// src/utils/validators.js
const Joi = require('joi');

exports.validateCoordinates = (longitude, latitude) => {
  const schema = Joi.object({
    longitude: Joi.number().min(-180).max(180).required(),
    latitude: Joi.number().min(-90).max(90).required()
  });

  return schema.validate({ longitude, latitude });
};

exports.validateDateRange = (startDate, endDate) => {
  const schema = Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref('startDate')).required()
  });

  return schema.validate({ startDate, endDate });
};

exports.validateTimeSlot = (startTime, endTime) => {
  const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
  
  if (!timePattern.test(startTime) || !timePattern.test(endTime)) {
    return { error: { message: 'Invalid time format. Use HH:MM' } };
  }

  const start = startTime.split(':').map(Number);
  const end = endTime.split(':').map(Number);
  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];

  if (endMinutes <= startMinutes) {
    return { error: { message: 'End time must be after start time' } };
  }

  return { value: true };
};