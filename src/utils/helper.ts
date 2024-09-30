export const parseAnswer = (text: string) => {
    // Convert **bold** to <strong>bold</strong>
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  
    // Convert *italic* to <em>italic</em>
    text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
  
    // Convert `code` to <code>code</code>
    text = text.replace(/`(.*?)`/g, "<code>$1</code>");
  
    // Convert URLs to clickable links
    text = text.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
  
    // Convert newlines to <br> tags
    text = text.replace(/\n/g, "<br>");
  
    return text;
  };