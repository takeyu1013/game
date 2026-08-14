const css = `
html,
body,
#root {
  margin: 0;
  min-height: 100%;
  background: #111;
}
.game {
  display: flex;
  justify-content: center;
  padding-top: 24px;
}
.error {
  color: #f88;
  text-align: center;
}
`;

const ensureMeta = (name: string, content: string): void => {
  if (document.querySelector(`meta[name="${name}"]`)) {
    return;
  }
  const meta = document.createElement("meta");
  meta.name = name;
  meta.content = content;
  document.head.append(meta);
};

export const mountRoot = (): HTMLElement => {
  document.documentElement.lang = "ja";
  document.title = "game";
  ensureMeta("viewport", "width=device-width, initial-scale=1.0");
  const style = document.createElement("style");
  style.textContent = css;
  document.head.append(style);
  const root = document.createElement("div");
  root.id = "root";
  document.body.append(root);
  return root;
};
