const t = [
  {
    name: "Umbraco Community Html Exporter Entrypoint",
    alias: "Umbraco.Community.HtmlExporter.Entrypoint",
    type: "backofficeEntryPoint",
    js: () => import("./entrypoint-DvrHMrub.js")
  }
], a = [
  {
    name: "Umbraco Community Html Exporter Dashboard",
    alias: "Umbraco.Community.HtmlExporter.Dashboard",
    type: "dashboard",
    js: () => import("./dashboard.element-DjxGafqx.js"),
    meta: {
      label: "Example Dashboard",
      pathname: "example-dashboard"
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: "Umb.Section.Content"
      }
    ]
  }
], o = [
  ...t,
  ...a
];
export {
  o as manifests
};
//# sourceMappingURL=umbraco-community-html-exporter.js.map
