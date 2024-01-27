// todoRoutes.js
const express = require("express");
const router = express.Router();

// Require todo model
const Todo = require("../schemas/todo");

// Routes

// Get all todos
router.get("/", async (req, res) => {
  try {
    const userTodos = await Todo.find({});
    res.json(userTodos);
  } catch (err) {
    res.status(500).send({ message: "Server Error" });
  }
});

// Add a new todo
router.post("/", async (req, res) => {
  try {
    const newTodo = new Todo({
      title: req.body.title,
      createdBy: req.body.createdBy
    });

    await newTodo.save();

    res.json(newTodo);
  } catch (err) {
    res.status(500).send({ message: "Server Error" });
  }
});

// Delete a todo
router.delete("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await Todo.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).send({ message: "Server Error" });
  }
});

// Toggle completion of a todo
router.put("/:id/toggle", async (req, res) => {
  const id = req.params.id;

  try {
    const todo = await Todo.findById(id);
    todo.completed = !todo.completed;
    await todo.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).send({ message: "Server Error" });
  }
});

// Update a todo's task
router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const updatedTitle = req.body.title;

  try {
    const todo = await Todo.findById(id);
    todo.title = updatedTitle;
    await todo.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).send({ message: "Server Error" });
  }
});

module.exports = router;
