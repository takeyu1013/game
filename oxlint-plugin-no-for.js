const reportFor = (context) => (node) => {
  context.report({ node, message: "for文は使用できません。" });
};

const plugin = {
  meta: {
    name: "no-for",
  },
  rules: {
    "no-for": {
      meta: {
        type: "problem",
        docs: {
          description: "Disallow for statements",
        },
      },
      create(context) {
        const report = reportFor(context);
        return {
          ForStatement: report,
          ForInStatement: report,
          ForOfStatement: report,
        };
      },
    },
  },
};

export default plugin;
