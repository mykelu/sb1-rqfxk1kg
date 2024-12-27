export function formatToGMT8(date: Date): string {
  return new Date(date.getTime() + (8 * 60 * 60 * 1000)).toISOString();
}

export function formatDateTime(dateString: string): string {
  try {
    if (!dateString || typeof dateString !== 'string') {
      return 'Unknown date';
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    
    const formatted = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
    
    return formatted;
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Unknown date';
  }
}

export function isValidDate(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }
  
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}