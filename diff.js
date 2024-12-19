// Diff Match and Patch implementation for word-level diffing
const Diff = {
  diffWords: function(oldText, newText) {
    const oldWords = this.tokenize(oldText);
    const newWords = this.tokenize(newText);
    const changes = this.computeDiff(oldWords, newWords);
    return this.formatChanges(changes, oldWords, newWords);
  },

  tokenize: function(text) {
    // Split text into words, preserving whitespace and punctuation
    return text.match(/\S+|\s+/g) || [];
  },

  computeDiff: function(oldWords, newWords) {
    const matrix = Array(oldWords.length + 1).fill().map(() => 
      Array(newWords.length + 1).fill(0)
    );

    // Fill the matrix
    for (let i = 0; i <= oldWords.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= newWords.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= oldWords.length; i++) {
      for (let j = 1; j <= newWords.length; j++) {
        if (oldWords[i-1] === newWords[j-1]) {
          matrix[i][j] = matrix[i-1][j-1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i-1][j] + 1,   // deletion
            matrix[i][j-1] + 1,   // insertion
            matrix[i-1][j-1] + 1  // substitution
          );
        }
      }
    }

    // Backtrack to find the changes
    const changes = [];
    let i = oldWords.length;
    let j = newWords.length;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && oldWords[i-1] === newWords[j-1]) {
        changes.unshift({ value: oldWords[i-1] });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || matrix[i][j-1] <= matrix[i-1][j])) {
        changes.unshift({ value: newWords[j-1], added: true });
        j--;
      } else if (i > 0 && (j === 0 || matrix[i][j-1] > matrix[i-1][j])) {
        changes.unshift({ value: oldWords[i-1], removed: true });
        i--;
      }
    }

    return changes;
  },

  formatChanges: function(changes) {
    // Merge adjacent changes of the same type
    const merged = [];
    let current = null;

    changes.forEach(change => {
      if (!current || 
          (current.added !== change.added && current.removed !== change.removed)) {
        current = { value: change.value };
        if (change.added) current.added = true;
        if (change.removed) current.removed = true;
        merged.push(current);
      } else {
        current.value += change.value;
      }
    });

    return merged;
  }
}; 