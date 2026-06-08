const express = require('express');
const router = express.Router();
const { getTasks, getTaskById, createTask, updateTask, deleteTask } = require('../controllers/task.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { taskValidation } = require('../middlewares/validators');
const { validateRequest } = require('../middlewares/validate.middleware');

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management endpoints
 */

router.use(authenticate); // All task routes require auth

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', taskValidation, validateRequest, createTask);
router.put('/:id', taskValidation, validateRequest, updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
