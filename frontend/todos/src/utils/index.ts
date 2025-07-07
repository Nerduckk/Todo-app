class Utils {
  static formatDate(date: Date | string | null | undefined): string {
    if (!date) return '';
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return '';
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(parsedDate.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }


  static formatDateTime(date: Date | string | null | undefined): string {
    const parsedDate = new Date(date as string)
    return isNaN(parsedDate.getTime())
      ? ''
      : parsedDate.toISOString().slice(0, 19).replace('T', ' ')
  }
  
}

export default Utils
