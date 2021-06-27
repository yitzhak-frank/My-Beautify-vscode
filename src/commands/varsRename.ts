const varsRename = (content: string): string => content.replace(/(.*[^.a-zA-Z0-9$_])var\b/g, (match: string) => match.replace(/var\b/, 'let'));

export default varsRename;