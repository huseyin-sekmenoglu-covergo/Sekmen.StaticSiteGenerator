export const manifests: Array<UmbExtensionManifest> = [
  {
    name: "Umbraco Community Html Exporter Dashboard",
    alias: "Umbraco.Community.HtmlExporter.Dashboard",
    type: "dashboard",
    js: () => import("./dashboard.element.js"),
    meta: {
      label: "HTML Exporter",
      pathname: "html-exporter-dashboard",
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: "Umb.Section.Content",
      },
    ],
  },
];
