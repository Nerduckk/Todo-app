"use strict";

const express = require("express");
const TodoController = require("../../controllers/todo.controller");
const router = express.Router();
const { asyncHandler } = require("../../helpers/asyncHandler");


router.post("", asyncHandler(TodoController.createTodo));
router.get("/get-page", asyncHandler(TodoController.getPaginatedTodos));
router.get("/get-by-id/:id", asyncHandler(TodoController.getTodoById));
router.patch("/update/:id", asyncHandler(TodoController.updateTodo));
router.delete("/delete/:id", asyncHandler(TodoController.deleteTodo));
router.delete("/delete-permanently/:id", asyncHandler(TodoController.deleteTodoPermanently));
router.patch("/restore/:id", asyncHandler(TodoController.restoreTodo));
router.patch("/archive/:id", asyncHandler(TodoController.archiveTodo));
router.patch("/unarchive/:id", asyncHandler(TodoController.unarchiveTodo));
router.patch("/complete/:id", asyncHandler(TodoController.completeTodo));

module.exports = router;