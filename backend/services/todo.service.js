const CreateTodoRequestDto = require('../dtos/request/create.todo.request.dto');
const GetTodoPageRequestDto = require('../dtos/request/get.todo.page.request.dto');
const Todo = require('../repositories/todo.repository');
const { BadRequestError } = require('../core/error.response');
const PaginationTodoResponseDto = require('../dtos/response/pagination.todo.response.dto');
const TodoResponseDto = require('../dtos/response/todo.response.dto');
const UpdateTodoRequestDto = require('../dtos/request/update.todo.request.dto');

class TodoService {
    static async createTodoAsync(data){
        try {
            const createTodoRequestDto = new CreateTodoRequestDto(data);
            createTodoRequestDto.validate();
            await Todo.createTodo(createTodoRequestDto.toJson());
            return true;
        } catch (error) {
            throw new BadRequestError(`Failed to create todo: ${error.message}`);
        }
    }

    static async getPaginatedTodosAsync(data){
        try {
            const getTodoPageRequestDto = new GetTodoPageRequestDto(data);
            getTodoPageRequestDto.validate();
            const { value, totalPages, totalRecords } = await Todo.getPaginatedTodos(getTodoPageRequestDto.toJson());
            return new PaginationTodoResponseDto({
                totalPages,
                totalRecords,
                value
            });
        } catch (error) {
            throw new BadRequestError(`Failed to get paginated todos: ${error.message}`);
        }
    }

    static async getTodoByIdAsync(id){
        try {
            const todo = await Todo.getTodoById(id);
            if (!todo) {
                throw new NotFoundError(`Todo with id ${id} not found`);
            }
            return new TodoResponseDto(todo);
        } catch (error) {
            throw new BadRequestError(`Failed to get todo by id: ${error.message}`);
        }
    }

    static async updateTodoAsync(id, data){
        try {
            const updateTodoRequestDto = new UpdateTodoRequestDto(data);
            const foundTodo = await Todo.getTodoById(id);
            if (!foundTodo) {
                throw new NotFoundError(`Todo with id ${id} not found`);
            }
            if (foundTodo.is_deleted) {
                throw new BadRequestError(`Todo with id ${id} is deleted`);
            }
            updateTodoRequestDto.validate();
            await Todo.updateTodo(id, updateTodoRequestDto.toJson());
            return true;
        } catch (error) {
            throw new BadRequestError(`Failed to update todo: ${error.message}`);
        }
    }

    static async deleteTodoAsync(id){
        try {
            const foundTodo = await Todo.getTodoById(id);
            if (!foundTodo) {
                throw new NotFoundError(`Todo with id ${id} not found`);
            }
            if (foundTodo.is_deleted) {
                throw new BadRequestError(`Todo with id ${id} is already deleted`);
            }
            await Todo.deleteTodo(id);
            return true;
        } catch (error) {
            throw new BadRequestError(`Failed to delete todo: ${error.message}`);
        }
    }

    static async deleteTodoPermanentlyAsync(id){
        try {
            const foundTodo = await Todo.getTodoById(id);
            if (!foundTodo) {
                throw new NotFoundError(`Todo with id ${id} not found`);
            }
            await Todo.deleteTodoPermanently(id);
            return true;
        } catch (error) {
            throw new BadRequestError(`Failed to delete todo permanently: ${error.message}`);
        }
    }

    static async restoreTodoAsync(id){
        try {
            const foundTodo = await Todo.getTodoById(id);
            if (!foundTodo) {
                throw new NotFoundError(`Todo with id ${id} not found`);
            }
            await Todo.restoreTodo(id);
            return true;
        } catch (error) {
            throw new BadRequestError(`Failed to restore todo: ${error.message}`);
        }
    }

    static async archiveTodoAsync(id){
        try {
            const foundTodo = await Todo.getTodoById(id);
            if (!foundTodo) {
                throw new NotFoundError(`Todo with id ${id} not found`);
            }
            await Todo.archiveTodo(id);
            return true;
        } catch (error) {
            throw new BadRequestError(`Failed to archive todo: ${error.message}`);
        }
    }

    static async unarchiveTodoAsync(id){
        try {
            const foundTodo = await Todo.getTodoById(id);
            if (!foundTodo) {
                throw new NotFoundError(`Todo with id ${id} not found`);
            }
            await Todo.unarchiveTodo(id);
            return true;
        } catch (error) {
            throw new BadRequestError(`Failed to unarchive todo: ${error.message}`);
        }
    }

    static async completeTodoAsync(id){
        try {
            const foundTodo = await Todo.getTodoById(id);
            if (!foundTodo) {
                throw new NotFoundError(`Todo with id ${id} not found`);
            }
            await Todo.completeTodo(id);
            return true;
        } catch (error) {
            throw new BadRequestError(`Failed to complete todo: ${error.message}`);
        }
    }
}

module.exports =  TodoService;