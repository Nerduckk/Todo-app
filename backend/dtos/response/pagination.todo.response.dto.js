class PaginationTodoResponseDto {

    constructor(data) {
        this.total_page = data.totalPages;
        this.total_records = data.totalRecords;
        this.value = data.value;
    }

    toJson() {
        return {
            total_page: this.total_page,
            total_records: this.total_records,
            value: this.value
        }
    }
}

module.exports = PaginationTodoResponseDto;