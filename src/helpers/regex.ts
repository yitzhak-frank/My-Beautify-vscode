export const
    COMMA                                         = /,/,
    COMMA_OR_EMPTY_LINE                           = /^( +|)(,|$)/,
    COMMA_AT_END                                  = /,( +|)$/,

    COMMENT                                       = /^( +|)(\/\/)|(\/\*)/,
    ONE_LINE_COMMENT                              = /^( +|)\/\//,
    MULTILINE_COMMENT_STARTS                      = /^( +|)\/\*/,
    MULTILINE_COMMENT_ENDS                        = /(\*\/)/,

    SEMICOLON_AND_SPACE_AROUND_AT_END             = /( +|);( +|)$/,
    SEMICOLON_AND_SPACE_AROUND_AT_LINE_END_G      = /( +|);( +|)($|\n|\)|\}|,)/g,
    TWO_SEMICOLON_OR_MORE_AT_END                  = /;;+( +|)$/,
    SEMICOLON_AT_END                              = /;( +|)$/,
    ONLY_SEMICOLON                                = /^( +|);+( +|)$/,

    WHITE_SPACE_AT_START                          = /^ +/,
    WHITE_SPACE_ONLY                              = /^ +$/,
    WHITE_SPACE_ONLY_OR_EMPTY                     = /^( +|)$/,
    ONE_SPACE_OR_MORE_G                           = / +/g,
    TWO_SPACE_OR_MORE_G                           = /  +/g,

    ROUND_BRACKETS_OPEN_G                         = /\(/g,
    ROUND_BRACKETS_CLOSE_AND_SPACE_BEFORE_G       = / +\)/g,
    CURLY_BRACKETS_OPEN_G                         = /{/g,
    CURLY_BRACKETS_CLOSE_G                        = /}/g,
    CURLY_BRACKETS_OPEN_AT_START                  = /^( +|){/,
    CURLY_BRACKETS_OPEN_AND_SPACE_BEFORE_AT_START = /^ +{/,
    CURLY_BRACKETS_CLOSE_AND_SPACE_AFTER_AT_END   = /} +$/,
    CURLY_BRACKETS_OPEN_AT_END                    = /\{( +|)$/,
    CURLY_BRACKETS_CLOSE_AT_END                   = /}( +|)$/,

    VARIABLE_DECLARETION                          = /^( +|)(var|let|const) +[A-Za-z_$0-9]+( +|)=/,
    ANYTHING_BUT_VARIABLE                         = /^.*[^a-zA-Z0-9$_]/,
    VARIABLE_AUTHORIZED_CHARS                     = /[a-zA-Z0-9_$]/,
    ANYTHING_BUT_VARIABLE_AUTHORIZED_CHARS        = /^.*[^a-zA-Z0-9$_]/,
    VAR_OR_LET_VARIABLE_NAME                      = /(?<=.*[^.a-zA-Z0-9$_](let|var)\s)(\w+)/,
    VAR_OR_LET_DECLARETION                        = /^(| +)(let|var)\b/,
    STRING_AFTER_VAR_OR_LET_WORD                  = /(?<=(.*[^.a-zA-Z0-9$_]|^)(let|var)\s).*/,
    VAR_DECLARETION_G                             = /(.*[^.a-zA-Z0-9$_])var\b/g,

    ARROW_FUNCTION_SIGN                           = /=>/,
    ARROW_FUNCTION_SIGN_AT_END                    = /=>( +|);( +|)$/,
    FUNCTION_DECLARETION                          = /((^|\(| |:|\?|=|\||&|,)function\b(| +)(|[a-zA-Z0-9_$]+)(| +)\()|=>/,
    FUNCTION_NOT_ARROW_DECLARETION                = /(^|\(| |:|\?|=|\||&|,)function\b(| +)(|[a-zA-Z0-9_$]+)(| +)\(/,
    MULTIPLE_FUNCTIONS_NOT_ARROW_G                = /(^|\(| |:|\?|=|\||&|,)function\b(| +)(|[a-zA-Z0-9_$]+)(| +)\(/g,
    FUNCTION_AFTER_LOGICAL_OPERATORS              = /(\||&)( +|)function\b(| +)(|[a-zA-Z0-9_$]+)(| +)\(/,
    FUNCTION_SCOPE_START                          = /(^|\(| |:|\?|=|\||&|,)function\b.*\)( +|){/,
    FUNCTION_NAME                                 = /(?<=(^|\(| |:|\?|=|\||&|,)function\s)(\w+)/,
    FUNCTION_ASSIGNED_TO_VARIABLE                 = /[^=]=( +|)function\b/,
    FUNCTION_AT_START                             = /(^|export\b)(| +)function\b/,
    ANONYMOUS_FUNCTION                            = /(^|\(| |:|\?|=|\||&|,)function\b(| +)\(/,
    ONE_LINE_FUNCTION                             = /=>(| +)[^{]/,
    FUNCTION_WORD_AND_SPACE_AFTER                 = /function\b( +|)/,
    NO_PARAMETERS                                 = /\(( +|)\)/,

    THIS_WORD                                     = /(.*[^.a-zA-Z0-9$_]|^| )this\b/,
    VAR_WORD                                      = /var\b/,
    RETURN_WORD                                   = /(.*[^.a-zA-Z0-9$_]|^| )return\b/,
    CATCH_ONLY_RETURN_WORD                        = /(?<=[^.a-zA-Z0-9$_]|^| )return\b/,
    RETURN_OBJECT                                 = /(.*[^.a-zA-Z0-9$_]|^| )return\b( +|){/,
    
    EQUAL_AT_END                                  = /[^=]=( +|)$/,
    FIRST_EQUAL                                   = /=/,
    FIRST_EQUAL_AND_STRING_AFTER                  = /=(.*)/,

    EXPORT_DEFAULT                                = /^(| +)(export +default +)/,
    MODULE_EXPORTS                                = /^(| +)(module(| +)\.(| +)exports\b)(| +)=/,
    LINE_BREAKS_G                                 = /\n/g,
    IMPORT_STATEMENT                              = /^( +|)import.*('|")/,
    CHARS_NEEDS_ESCAPE_G                          = /\(|\)|\+|\||\[|\]|\*|\.\?\!|\$|\:/g,
    REGEX_CONTENT_G                               = /((?<==|\||\+|\?|:|,|^|&|^)( +|))\/([^\/]+|(\\\/))+([^\\]\/)/g,
    START_AND_SPACE_AFTER                         = /^( +|)/,

    REGEX_PLACEHOLDER_G                           = /_\$_REGEX_\$_/g,
    STRING_PLACEHOLDER_G                           = /_\$_STRING_\$_/g,

    EMPTY_SCOPE                                   = /^( +|){([\n ]+|)}( +|)$/,
    DOT_AFTER_SCOPE_WRAPPER                       = /^( +|)\)\./,
    SCOPE_WITH_ONE_LINE_CONTENT                   = /^\{(\n+|).*(\n+|)\}(.*[^\n]|)$/,
    CONTROL_FLOW_WORD                             = /(.*[^.a-zA-Z0-9$_]|^| )(if|for|while|do|let|var|const)\b/,
    CONTROL_FLOW_STATEMENT                        = /((.*[^.a-zA-Z0-9$_]|^| )(if|for|while|do|else)\b)/,
    CONTROL_FLOW_SCOPE_START                      = /(((((if|for|while)\b).*\)|(else|do)\b))|=>)( +|){/,
    CONTROL_FLOW_WITH_CONDITION_STATEMENT_CONTENT = /^.*(\)( +|)\{)/,
    CONTROL_FLOW_WITH_NO_CONDITION_AND_ARROW_FUNCTION_STATEMENT = /^.*(do\b|(else\b(?! +if))|=>)/,

    FUNCTION_AND_ARGS                      = (args: string) => new RegExp(`function\\b( +|)${args}.*$`),
    
    NAMED_FUNCTION_DECLARETION     = (functionName: string) => new RegExp(`function\\b +${functionName}`),
    
    FUNCTION_INVOKED               = (functionName: string) => new RegExp(`(.*[^.a-zA-Z0-9$_]|^| |\\n)${functionName}\\b`),

    WHITE_SPACE_AFTER_STATEMENT       = (statement: string) => new RegExp(`(?<=${statement})( +)`),
    
    VALUE_ASSIGN_TO_VARIABLE           = (variable: string) => new RegExp(`(^| |;)(let|var) +(${variable})( +|)=`),

    VARIABLE_EXIST                     = (variable: string) => new RegExp(`(.*([^.a-zA-Z0-9$_])|^)${variable}(.*([^.a-zA-Z0-9$_])|$)`),

    EQUAL_WITH_NO_VALUE_AFTER_VARIABLE = (variable: string) => new RegExp(`((.*([^.a-zA-Z0-9$_])|^)${variable})( +|)=( +|)$`),

    VARIABLE_VALUE_CHANGE              = (variable: string) => new RegExp(`.*([-+]{2}(| +)${variable})|(.*[^.a-zA-Z0-9$_]|^| )(?<!(\\b(var|let|const)\\b)( +|))(${variable}(| +)((?=[^=])([-*\\/+%=]{2})|([^=]=[^=])))`);