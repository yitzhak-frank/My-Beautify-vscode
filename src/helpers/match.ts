export const isComment = (line: string): boolean => !!line.match(/( +|)(\/\/)|(\/\*)/);

export const isMultilineCommentStarts = (line: string): boolean => !!line.match(/(\/\*)/);

export const isMultilineCommentEnds = (line: string): boolean => !!line.match(/(\*\/)/);
