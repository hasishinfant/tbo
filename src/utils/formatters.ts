// Formatting utility functions
export const formatters = {
  // Format currency
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  },

  // Format currency range
  formatCurrencyRange(min: number, max: number, currency: string = 'USD'): string {
    return `${formatters.formatCurrency(min, currency)} - ${formatters.formatCurrency(max, currency)}`;
  },

  // Format time for chat messages
  formatTime(date: Date): string {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) { // Less than 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      // More than 24 hours, show time
      return messageDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  },

  // Capitalize first letter
  capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  },

  // Format budget level for display
  formatBudgetLevel(budget: string): string {
    const budgetMap: Record<string, string> = {
      low: 'Budget-Friendly',
      medium: 'Mid-Range',
      luxury: 'Luxury',
    };
    return budgetMap[budget] || formatters.capitalize(budget);
  },

  // Format interests array for display
  formatInterests(interests: string[]): string {
    if (interests.length === 0) return 'No specific interests';
    if (interests.length === 1) return formatters.capitalize(interests[0]);
    if (interests.length === 2) return interests.map(formatters.capitalize).join(' and ');
    
    const lastInterest = interests[interests.length - 1];
    const otherInterests = interests.slice(0, -1);
    return otherInterests.map(formatters.capitalize).join(', ') + ', and ' + formatters.capitalize(lastInterest);
  },

  // Truncate text with ellipsis
  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  },

  // Format phone number
  formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX for US numbers
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    
    // Return original if not a standard format
    return phone;
  },

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
};