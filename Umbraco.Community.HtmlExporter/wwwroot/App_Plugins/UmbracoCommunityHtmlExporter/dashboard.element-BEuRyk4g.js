import { LitElement as y, html as m, css as _, state as b, customElement as x } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as E } from "@umbraco-cms/backoffice/element-api";
import { UMB_NOTIFICATION_CONTEXT as U } from "@umbraco-cms/backoffice/notification";
import { c as p, f as D } from "./client.gen-Cs-igdZt.js";
class c {
  static exportWebsite(e) {
    return (e?.client ?? p).post({
      ...D,
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/umbracocommunityhtmlexporter/api/v1/export-website",
      ...e,
      headers: {
        "Content-Type": null,
        ...e?.headers
      }
    });
  }
  static getData(e) {
    return (e?.client ?? p).get({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/umbracocommunityhtmlexporter/api/v1/get-data",
      ...e
    });
  }
}
var w = Object.defineProperty, S = Object.getOwnPropertyDescriptor, f = (t) => {
  throw TypeError(t);
}, g = (t, e, r, i) => {
  for (var a = i > 1 ? void 0 : i ? S(e, r) : e, s = t.length - 1, n; s >= 0; s--)
    (n = t[s]) && (a = (i ? n(e, r, a) : n(a)) || a);
  return i && a && w(e, r, a), a;
}, v = (t, e, r) => e.has(t) || f("Cannot " + r), u = (t, e, r) => (v(t, e, "read from private field"), e.get(t)), h = (t, e, r) => e.has(t) ? f("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), C = (t, e, r, i) => (v(t, e, "write to private field"), e.set(t, r), r), o, d;
let l = class extends E(y) {
  constructor() {
    super(), h(this, o), h(this, d, async (t) => {
      const e = t.target;
      e.state = "waiting";
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
        e.state = "failed", console.error(i);
        return;
      }
      r !== void 0 && (e.state = "success"), u(this, o) && u(this, o).peek("warning", {
        data: {
          headline: "You are",
          message: "Your email is"
        }
      });
    }), this.consumeContext(U, (t) => {
      C(this, o, t);
    }), c.getData().then((t) => {
      this._serverDomainData = t.data;
    }).catch((t) => {
      console.error(t), u(this, o) && u(this, o).peek("danger", {
        data: {
          headline: "Error fetching data from server",
          message: "See console for details"
        }
      });
    });
  }
  render() {
    return m`
      <uui-box headline="Export Settings" class="wide">
        <uui-form>
          <uui-form-layout-item>
            <uui-label for="sourceSite">Select source site</uui-label>
            <uui-radio-group name="sourceSite" id="sourceSite" required>
              ${this._serverDomainData?.domains?.map(
      (t) => m`<uui-radio id="${t.url}" name="site" value="${t.name}">
                    ${t.url}
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
                  value="${this._serverDomainData?.settings?.outputFolder || ""}"
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
              rows="5"
              value="${this._serverDomainData?.settings?.additionalUrls.join(`
`) || ""}"
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
                  value="${this._serverDomainData?.settings?.targetUrl || ""}"
            ></uui-input>
          </uui-form-layout-item>
          <uui-button
            color="default"
            look="primary"
            @click="${u(this, d)}"
          >
            Export HTML
          </uui-button>
        </uui-form>
      </uui-box>
    `;
  }
};
o = /* @__PURE__ */ new WeakMap();
d = /* @__PURE__ */ new WeakMap();
l.styles = [
  _`
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
  x("html-exporter-dashboard")
], l);
const R = l;
export {
  l as HtmlExporterDashboardElement,
  R as default
};
//# sourceMappingURL=dashboard.element-BEuRyk4g.js.map
