import { COMMENT, MULTILINE_COMMENT_ENDS, MULTILINE_COMMENT_STARTS } from "./regex";

export const isComment = (line: string): boolean => !!line.match(COMMENT);

export const isMultilineCommentStarts = (line: string): boolean => !!line.match(MULTILINE_COMMENT_STARTS);

export const isMultilineCommentEnds = (line: string): boolean => !!line.match(MULTILINE_COMMENT_ENDS);
