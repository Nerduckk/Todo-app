class UpdateTodoRequestDto {
    constructor(data) {
        this.title = data.title;
        this.description = data.description;
        this.status = data.status;
        this.expires_at = data.expires_at;
        this.completed_at = data.completed_at;
    }

    validate() {
        if (!this.title) {
            throw new Error('Title is required');
        }
    }

    toJson() {
        return {
            title: this.title,
            description: this.description,
            status: this.status,
            expires_at: this.expires_at,
            completed_at: this.completed_at
        }
    }
}

module.exports = UpdateTodoRequestDto;