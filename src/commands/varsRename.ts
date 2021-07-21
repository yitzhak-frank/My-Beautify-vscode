import { VAR_DECLARETION_G, VAR_WORD } from "../helpers/regex";

const varsRename = (content: string): string => content.replace(VAR_DECLARETION_G, (match: string) => match.replace(VAR_WORD, 'let'));

export default varsRename;