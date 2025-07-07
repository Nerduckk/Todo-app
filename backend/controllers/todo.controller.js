const { SuccessResponse } = require("../core/success.response");
const TodoService = require("../services/todo.service");

class TodoController {
    createTodo = async (req, res, next) => {
        new SuccessResponse({
            message: "Todo created successfully",
            metadata: await TodoService.createTodoAsync(req.body)
        }).send(res);   
    }

    getPaginatedTodos = async (req, res, next) => {
        new SuccessResponse({
            message: "Get paginated todos successfully",
            metadata: await TodoService.getPaginatedTodosAsync(req.query)
        }).send(res);
    }

    getTodoById = async (req, res, next) => {
        new SuccessResponse({
            message: "Get todo by id successfully",
            metadata: await TodoService.getTodoByIdAsync(req.params.id)
        }).send(res);
    }

    updateTodo = async (req, res, next) => {
        new SuccessResponse({
            message: "Update todo successfully",
            metadata: await TodoService.updateTodoAsync(req.params.id, req.body)
        }).send(res);
    }

    deleteTodo = async (req, res, next) => {
        new SuccessResponse({
            message: "Delete todo successfully",
            metadata: await TodoService.deleteTodoAsync(req.params.id)
        }).send(res);
    }

    deleteTodoPermanently = async (req, res, next) => {
        new SuccessResponse({
            message: "Delete todo permanently successfully",
            metadata: await TodoService.deleteTodoPermanentlyAsync(req.params.id)
        }).send(res);
    }

    restoreTodo = async (req, res, next) => {
        new SuccessResponse({
            message: "Restore todo successfully",
            metadata: await TodoService.restoreTodoAsync(req.params.id)
        }).send(res);
    }

    archiveTodo = async (req, res, next) => {
        new SuccessResponse({
            message: "Archive todo successfully",
            metadata: await TodoService.archiveTodoAsync(req.params.id)
        }).send(res);
    }

    unarchiveTodo = async (req, res, next) => {
        new SuccessResponse({
            message: "Unarchive todo successfully",
            metadata: await TodoService.unarchiveTodoAsync(req.params.id)
        }).send(res);
    }

    completeTodo = async (req, res, next) => {
        new SuccessResponse({
            message: "Complete todo successfully",
            metadata: await TodoService.completeTodoAsync(req.params.id)
        }).send(res);
    }
}

module.exports = new TodoController();