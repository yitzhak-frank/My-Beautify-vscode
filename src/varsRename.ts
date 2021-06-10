const varsRename = (content: string): string => content.replace(/var\b/g, 'let');

export default varsRename;