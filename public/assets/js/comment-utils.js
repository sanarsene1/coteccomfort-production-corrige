const DEFAULT_COMMENTS = [];

function pickApprovedComments(comments = DEFAULT_COMMENTS, limit = 4) {
  const approvedComments = Array.isArray(comments)
    ? comments.filter((comment) => comment && comment.status === 'approved' && typeof comment.text === 'string' && comment.text.trim().length > 0)
    : [];

  if (approvedComments.length <= limit) {
    return approvedComments;
  }

  const shuffled = [...approvedComments];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled.slice(0, limit);
}

function pickVisibleComments(comments = DEFAULT_COMMENTS, visibleLimit = 5) {
  const approvedComments = Array.isArray(comments)
    ? comments.filter((comment) => comment && (comment.status === 'approved' || comment.status === 'pending') && typeof comment.text === 'string' && comment.text.trim().length > 0)
    : [];

  if (approvedComments.length <= visibleLimit) {
    return approvedComments;
  }

  const shuffled = [...approvedComments];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled.slice(0, visibleLimit);
}

function isValidComment(value) {
  return typeof value === 'string' && value.trim().length >= 3;
}

const commentUtils = { DEFAULT_COMMENTS, pickApprovedComments, pickVisibleComments, isValidComment };

if (typeof window !== 'undefined') {
  window.commentUtils = commentUtils;
}

export { DEFAULT_COMMENTS, pickApprovedComments, pickVisibleComments, isValidComment };
