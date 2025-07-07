const db = require('../db/init.mysql');

class Todo {
    static createTodo(data) {
        return db('todos').insert(data);
    }

    static async getPaginatedTodos(params) {
        const { 
            page = 1,
            page_size = 10,
            status_type = 'all'
        } = params;

        let filter = {};
        if(status_type == 'all') {
            filter = {
                is_deleted: false,
                is_archived: false,
            }
        }
        else if(status_type == 'pending') {
            filter = {
                is_deleted: false,
                is_archived: false,
                status: 'pending',
            }
        }
        else if(status_type == 'completed') {
            filter = {
                is_deleted: false,
                is_archived: false,
                status: 'completed',
            }
        }
        else if(status_type == 'archived') {
            filter = {
                is_deleted: false,
                is_archived: true,
                status: 'archived',
            }
        }
        else if(status_type == 'deleted') {
            filter = {
                is_deleted: true,
            }
        }

        const select = 'id,title,description,status,is_deleted,created_at,updated_at';
        const sort = 'created_at:desc';
    
        const offset = (page - 1) * page_size;
        const selectFields = select.split(',').map(field => field.trim());

        const baseQuery = db('todos')
            .where({ ...filter });
    
        const countQuery = baseQuery.clone().count('id as total').first();
        const totalRecords = await countQuery;
        const totalPages = Math.ceil(totalRecords.total / page_size);
    
        const dataQuery = baseQuery.clone()
            .select(selectFields)
            .orderBy(...sort.split(':'))
            .limit(page_size)
            .offset(offset);
    
        const value = await dataQuery;
    
        return {
            value,
            totalPages,
            totalRecords: totalRecords.total
        };
    }

    

    static getTodoById(id) {
        return db('todos').where('id', id).first();
    }

    static updateTodo(id, data) {
        return db('todos').where('id', id).update({ ...data, updated_at: new Date() });
    }

    static deleteTodo(id) {
        return db('todos').where('id', id).update({ is_deleted: true, updated_at: new Date() });
    }

    static deleteTodoPermanently(id) {
        return db('todos').where('id', id).delete();
    }

    static restoreTodo(id) {
        return db('todos').where('id', id).update({ is_deleted: false, updated_at: new Date() });
    }

    static archiveTodo(id) {
        return db('todos').where('id', id).update({ is_archived: true, status: 'archived', updated_at: new Date() });
    }

    static unarchiveTodo(id) {
        const foundTodo = this.getTodoById(id);
        if(foundTodo.completed_at !== null) {
            return db('todos').where('id', id).update({ is_archived: false, status: 'completed', updated_at: new Date() });
        }
        return db('todos').where('id', id).update({ is_archived: false, status: 'pending', updated_at: new Date() });
    }

    static completeTodo(id) {
        return db('todos').where('id', id).update({ completed_at: new Date(), status: 'completed', updated_at: new Date() });
    }

   
}

module.exports = Todo;