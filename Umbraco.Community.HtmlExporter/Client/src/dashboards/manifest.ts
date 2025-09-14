export const manifests: Array<UmbExtensionManifest> = [
  {
    name: "Umbraco Community Html Exporter Dashboard",
    alias: "Umbraco.Community.HtmlExporter.Dashboard",
    type: "dashboard",
    js: () => import("./dashboard.element.js"),
    meta: {
      label: "Example Dashboard",
      pathname: "example-dashboard",
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: "Umb.Section.Content",
      },
    ],
  },
];
