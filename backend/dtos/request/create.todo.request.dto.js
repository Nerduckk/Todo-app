class CreateTodoRequestDto {

    constructor(data) {
        this.title = data.title;
        this.description = data.description;
        this.expires_at = data.expires_at;
    }

    validate() {
        if (!this.title) {
            throw new Error('Title is required');
        }
        if (!this.expires_at) {
            throw new Error('Expires at is required');
        }
    }

    toJson() {
        return {
            title: this.title,
            description: this.description,
            expires_at: this.expires_at
        }
    }
}

module.exports = CreateTodoRequestDto;