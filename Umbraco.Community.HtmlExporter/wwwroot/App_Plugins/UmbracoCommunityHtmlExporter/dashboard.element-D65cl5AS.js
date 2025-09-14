import { LitElement as v, html as d, css as x, state as b, customElement as E } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as _ } from "@umbraco-cms/backoffice/element-api";
import { UMB_NOTIFICATION_CONTEXT as U } from "@umbraco-cms/backoffice/notification";
import { c as p, f as w } from "./client.gen-Cs-igdZt.js";
class c {
  static exportWebsite(t) {
    return (t?.client ?? p).post({
      ...w,
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/umbracocommunityhtmlexporter/api/v1/export-website",
      ...t,
      headers: {
        "Content-Type": null,
        ...t?.headers
      }
    });
  }
  static getDomains(t) {
    return (t?.client ?? p).get({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/umbracocommunityhtmlexporter/api/v1/get-domains",
      ...t
    });
  }
}
var D = Object.defineProperty, C = Object.getOwnPropertyDescriptor, f = (e) => {
  throw TypeError(e);
}, g = (e, t, r, i) => {
  for (var a = i > 1 ? void 0 : i ? C(t, r) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (a = (i ? n(t, r, a) : n(a)) || a);
  return i && a && D(t, r, a), a;
}, y = (e, t, r) => t.has(e) || f("Cannot " + r), u = (e, t, r) => (y(e, t, "read from private field"), t.get(e)), h = (e, t, r) => t.has(e) ? f("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), S = (e, t, r, i) => (y(e, t, "write to private field"), t.set(e, r), r), o, m;
let l = class extends _(v) {
  constructor() {
    super(), h(this, o), h(this, m, async (e) => {
      const t = e.target;
      t.state = "waiting";
      const { data: r, error: i } = await c.exportWebsite({
        body: {
          SiteUrl: this.shadowRoot?.getElementById("sourceSite")?.value,
          OutputFolder: this.shadowRoot?.getElementById("outputFolder")?.value,
          AdditionalUrls: this.shadowRoot?.getElementById("additionalUrls")?.value.split(`
`).map((a) => a.trim()).filter((a) => a.length > 0),
          TargetUrl: this.shadowRoot?.getElementById("targetUrl")?.value
        }
      });
      if (i) {
        t.state = "failed", console.error(i);
        return;
      }
      r !== void 0 && (t.state = "success"), u(this, o) && u(this, o).peek("warning", {
        data: {
          headline: "You are",
          message: "Your email is"
        }
      });
    }), this.consumeContext(U, (e) => {
      S(this, o, e);
    }), c.getDomains().then((e) => {
      this._serverDomainData = e.data;
    }).catch((e) => {
      console.error(e), u(this, o) && u(this, o).peek("danger", {
        data: {
          headline: "Error fetching data from server",
          message: "See console for details"
        }
      });
    });
  }
  render() {
    return d`
      <uui-box headline="Export Settings" class="wide">
        <uui-form>
          <uui-form-layout-item>
            <uui-label for="sourceSite">Select source site</uui-label>
            <uui-radio-group name="sourceSite" id="sourceSite" required>
              ${this._serverDomainData?.map(
      (e) => d`<uui-radio id="${e.url}" name="site" value="${e.name}">
                    ${e.url}
                  </uui-radio>`
    )}
            </uui-radio-group>
          </uui-form-layout-item>

          <uui-form-layout-item>
            <uui-label for="outputFolder">Output Folder</uui-label>
            <uui-input type="text" 
                  name="outputFolder"
                  id="outputFolder"
                  required
                  placeholder="Enter output folder"
                  value="C:\\Temp\\HtmlExport"
            ></uui-input>
          </uui-form-layout-item>

          <uui-form-layout-item>
            <uui-label for="additionalUrls">
              Additional URLs (one per line)
            </uui-label>
            <uui-textarea
              name="additionalUrls"
              id="additionalUrls"
              placeholder="Enter additional URLs (one per line)"
            ></uui-textarea>
          </uui-form-layout-item>

          <uui-form-layout-item>
            <uui-label for="targetUrl">
              Target URL
            </uui-label>
            <uui-input type="text" 
                  name="targetUrl" 
                  id="targetUrl" 
                  required 
                  placeholder="Enter target URL"
                  value="https://huseyinsekmenoglu.net/"
            ></uui-input>
          </uui-form-layout-item>
          <uui-button
            color="default"
            look="primary"
            @click="${u(this, m)}"
          >
            Export HTML
          </uui-button>
        </uui-form>
      </uui-box>
    `;
  }
};
o = /* @__PURE__ */ new WeakMap();
m = /* @__PURE__ */ new WeakMap();
l.styles = [
  x`
      :host {
        display: grid;
        gap: var(--uui-size-layout-1);
        padding: var(--uui-size-layout-1);
        grid-template-columns: 1fr 1fr 1fr;
      }

      uui-box {
        margin-bottom: var(--uui-size-layout-1);
      }

      h2 {
        margin-top: 0;
      }

      .wide {
        grid-column: span 3;
      }
    `
];
g([
  b()
], l.prototype, "_serverDomainData", 2);
l = g([
  E("html-exporter-dashboard")
], l);
const I = l;
export {
  l as HtmlExporterDashboardElement,
  I as default
};
//# sourceMappingURL=dashboard.element-D65cl5AS.js.map
