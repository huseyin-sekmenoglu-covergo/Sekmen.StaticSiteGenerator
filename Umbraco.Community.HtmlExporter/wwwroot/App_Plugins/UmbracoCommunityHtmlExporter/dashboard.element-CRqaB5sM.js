import { LitElement as E, html as h, css as _, state as b, customElement as U } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as D } from "@umbraco-cms/backoffice/element-api";
import { UMB_NOTIFICATION_CONTEXT as w } from "@umbraco-cms/backoffice/notification";
import { c, f as T } from "./client.gen-Cs-igdZt.js";
class f {
  static exportWebsite(e) {
    return (e?.client ?? c).post({
      ...T,
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
    return (e?.client ?? c).get({
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
var S = Object.defineProperty, C = Object.getOwnPropertyDescriptor, v = (t) => {
  throw TypeError(t);
}, y = (t, e, r, s) => {
  for (var u = s > 1 ? void 0 : s ? C(e, r) : e, i = t.length - 1, l; i >= 0; i--)
    (l = t[i]) && (u = (s ? l(e, r, u) : l(u)) || u);
  return s && u && S(e, r, u), u;
}, x = (t, e, r) => e.has(t) || v("Cannot " + r), o = (t, e, r) => (x(t, e, "read from private field"), e.get(t)), g = (t, e, r) => e.has(t) ? v("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), R = (t, e, r, s) => (x(t, e, "write to private field"), e.set(t, r), r), a, m;
let n = class extends D(E) {
  constructor() {
    super(), g(this, a), g(this, m, async (t) => {
      const e = t.target;
      e.state = "waiting";
      var r = this.shadowRoot?.getElementById("sourceSite")?.value, s = this.shadowRoot?.getElementById("outputFolder")?.value, u = this.shadowRoot?.getElementById("additionalUrls")?.value, i = this.shadowRoot?.getElementById("targetUrl")?.value;
      if (!r) {
        e.state = "failed", o(this, a) && o(this, a).peek("danger", {
          data: {
            headline: "Error",
            message: "Please select a valid source site URL"
          }
        });
        return;
      }
      if (!s) {
        e.state = "failed", o(this, a) && o(this, a).peek("danger", {
          data: {
            headline: "Error",
            message: "Please enter a valid output folder"
          }
        });
        return;
      }
      if (!i) {
        e.state = "failed", o(this, a) && o(this, a).peek("danger", {
          data: {
            headline: "Error",
            message: "Please enter a valid target URL"
          }
        });
        return;
      }
      i.endsWith("/") || (i += "/"), !i.startsWith("http://") && !i.startsWith("https://") && (i = "http://" + i);
      const { data: l, error: p } = await f.exportWebsite({
        body: {
          SiteUrl: r,
          OutputFolder: s,
          AdditionalUrls: u.split(`
`).map((d) => d.trim()).filter((d) => d.length > 0),
          TargetUrl: i
        }
      });
      if (p) {
        e.state = "failed", console.error(p);
        return;
      }
      l !== void 0 && (e.state = "success"), o(this, a) && o(this, a).peek("positive", {
        data: {
          headline: "Export started",
          message: "The HTML export has been started successfully."
        }
      }), setTimeout(() => {
        e.state = "success";
      }, 2e3);
    }), this.consumeContext(w, (t) => {
      R(this, a, t);
    }), f.getData().then((t) => {
      this._serverDomainData = t.data;
    }).catch((t) => {
      console.error(t), o(this, a) && o(this, a).peek("danger", {
        data: {
          headline: "Error fetching data from server",
          message: "See console for details"
        }
      });
    });
  }
  render() {
    return h`
      <uui-box headline="Export Settings" class="wide">
        <uui-form>
          <uui-form-layout-item>
            <uui-label for="sourceSite">Select source site</uui-label>
            <uui-radio-group name="sourceSite" id="sourceSite" required>
              ${this._serverDomainData?.domains?.map(
      (t) => h`<uui-radio name="site" value="${t.url}">
                    ${t.name} (${t.url})
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
            @click="${o(this, m)}"
          >
            Export HTML
          </uui-button>
        </uui-form>
      </uui-box>
    `;
  }
};
a = /* @__PURE__ */ new WeakMap();
m = /* @__PURE__ */ new WeakMap();
n.styles = [
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
y([
  b()
], n.prototype, "_serverDomainData", 2);
n = y([
  U("html-exporter-dashboard")
], n);
const W = n;
export {
  n as HtmlExporterDashboardElement,
  W as default
};
//# sourceMappingURL=dashboard.element-CRqaB5sM.js.map
