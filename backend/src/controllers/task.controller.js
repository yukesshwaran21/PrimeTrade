const prisma = require('../config/database');

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Get all tasks (Admin sees all, User sees own)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [TODO, IN_PROGRESS, DONE] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [LOW, MEDIUM, HIGH] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of tasks
 *       401:
 *         description: Unauthorized
 */
const getTasks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, priority, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    // Role-based filtering
    if (req.user.role !== 'ADMIN') {
      where.userId = req.user.id;
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.task.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Tasks retrieved successfully.',
      data: {
        tasks,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: Get a single task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Task data
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 */
const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // Users can only access their own tasks
    if (req.user.role !== 'ADMIN' && task.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied. This task belongs to another user.' });
    }

    res.status(200).json({ success: true, message: 'Task retrieved.', data: { task } });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               status: { type: string, enum: [TODO, IN_PROGRESS, DONE] }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH] }
 *               dueDate: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Task created
 *       422:
 *         description: Validation error
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim(),
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: req.user.id,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.status(201).json({ success: true, message: 'Task created successfully.', data: { task } });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               status: { type: string, enum: [TODO, IN_PROGRESS, DONE] }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH] }
 *               dueDate: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Task updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 */
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate } = req.body;

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    if (req.user.role !== 'ADMIN' && existingTask.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.status(200).json({ success: true, message: 'Task updated successfully.', data: { task } });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Task deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 */
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    if (req.user.role !== 'ADMIN' && existingTask.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await prisma.task.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Task deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask };
