// @oxlint-plugins/oxlint-plugin-functional はnpm未公開のため、利用する構文ルールのみJSで実装する
export default {
  meta: {
    name: "functional",
  },
  rules: {
    "no-classes": {
      create(context) {
        const report = (node) => {
          context.report({
            node,
            message: "Unexpected class, use functions not classes.",
          });
        };
        return {
          ClassDeclaration: report,
          ClassExpression: report,
        };
      },
    },
    "no-loop-statements": {
      create(context) {
        const report = (node) => {
          context.report({
            node,
            message: "Unexpected loop, use map or reduce instead.",
          });
        };
        return {
          ForStatement: report,
          ForInStatement: report,
          ForOfStatement: report,
          WhileStatement: report,
          DoWhileStatement: report,
        };
      },
    },
    "no-throw-statements": {
      create(context) {
        return {
          ThrowStatement(node) {
            context.report({
              node,
              message: "Unexpected throw, throwing exceptions is not functional.",
            });
          },
        };
      },
    },
  },
};
