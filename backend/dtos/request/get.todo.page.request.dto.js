class GetTodoPageRequestDto {

    constructor(data) {
        this.page = data.page;
        this.page_size = data.page_size;
        this.status_type = data.status_type;
    }

    validate() {
        if (!this.page) {
            throw new Error('Page is required');
        }
    }

    toJson() {
        return {
            page: this.page,
            page_size: this.page_size,
            status_type: this.status_type,
        }
    }
}

module.exports = GetTodoPageRequestDto;