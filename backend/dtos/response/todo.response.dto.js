class TodoResponseDto {
    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.description = data.description;
        this.status = data.status;
        this.expires_at = data.expires_at;
        this.completed_at = data.completed_at;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    toJson() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            status: this.status,
            expires_at: this.expires_at,
            completed_at: this.completed_at,
            created_at: this.created_at,
            updated_at: this.updated_at
        }
    }
}

module.exports = TodoResponseDto;