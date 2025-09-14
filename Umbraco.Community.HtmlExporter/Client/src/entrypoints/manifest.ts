export const manifests: Array<UmbExtensionManifest> = [
  {
    name: "Umbraco Community Html Exporter Entrypoint",
    alias: "Umbraco.Community.HtmlExporter.Entrypoint",
    type: "backofficeEntryPoint",
    js: () => import("./entrypoint.js"),
  },
];
