import { LitElement as x, html as h, css as E, state as _, customElement as U } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as w } from "@umbraco-cms/backoffice/element-api";
import { UMB_NOTIFICATION_CONTEXT as D } from "@umbraco-cms/backoffice/notification";
import { c, f as S } from "./client.gen-Cs-igdZt.js";
class f {
  static exportWebsite(e) {
    return (e?.client ?? c).post({
      ...S,
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
var T = Object.defineProperty, C = Object.getOwnPropertyDescriptor, v = (t) => {
  throw TypeError(t);
}, y = (t, e, a, s) => {
  for (var l = s > 1 ? void 0 : s ? C(e, a) : e, o = t.length - 1, u; o >= 0; o--)
    (u = t[o]) && (l = (s ? u(e, a, l) : u(l)) || l);
  return s && l && T(e, a, l), l;
}, b = (t, e, a) => e.has(t) || v("Cannot " + a), i = (t, e, a) => (b(t, e, "read from private field"), e.get(t)), g = (t, e, a) => e.has(t) ? v("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, a), R = (t, e, a, s) => (b(t, e, "write to private field"), e.set(t, a), a), r, p;
let n = class extends w(x) {
  constructor() {
    super(), g(this, r), g(this, p, async (t) => {
      const e = t.target;
      e.state = "waiting";
      var a = this.shadowRoot?.getElementById("sourceSite")?.value, s = this.shadowRoot?.getElementById("outputFolder")?.value, l = this.shadowRoot?.getElementById("additionalUrls")?.value, o = this.shadowRoot?.getElementById("targetUrl")?.value;
      if (!a) {
        e.state = "failed", i(this, r) && i(this, r).peek("danger", {
          data: {
            headline: "Error",
            message: "Please select a valid source site URL"
          }
        });
        return;
      }
      if (!s) {
        e.state = "failed", i(this, r) && i(this, r).peek("danger", {
          data: {
            headline: "Error",
            message: "Please enter a valid output folder"
          }
        });
        return;
      }
      if (!o) {
        e.state = "failed", i(this, r) && i(this, r).peek("danger", {
          data: {
            headline: "Error",
            message: "Please enter a valid target URL"
          }
        });
        return;
      }
      o.endsWith("/") || (o += "/"), !o.startsWith("http://") && !o.startsWith("https://") && (o = "http://" + o);
      const { data: u, error: m } = await f.exportWebsite({
        body: {
          SiteUrl: a,
          OutputFolder: s,
          AdditionalUrls: l.split(`
`).map((d) => d.trim()).filter((d) => d.length > 0),
          TargetUrl: o
        }
      });
      if (m) {
        e.state = "failed", console.error(m), i(this, r) && i(this, r).peek("danger", {
          data: {
            headline: "Export failed",
            message: "An error occurred during export. See console for details."
          }
        });
        return;
      }
      u !== void 0 && (e.state = "success", i(this, r) && i(this, r).peek("positive", {
        data: {
          headline: "Export finished",
          message: "The HTML export has been finished successfully."
        }
      })), setTimeout(() => {
        e.state = "success";
      }, 2e3);
    }), this.consumeContext(D, (t) => {
      R(this, r, t);
    }), f.getData().then((t) => {
      this._serverDomainData = t.data;
    }).catch((t) => {
      console.error(t), i(this, r) && i(this, r).peek("danger", {
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
            <uui-label slot="label" for="sourceSite">Select source site</uui-label>
            <uui-radio-group name="sourceSite" id="sourceSite" required role="radiogroup">
              ${this._serverDomainData?.domains?.map(
      (t, e) => h`<uui-radio name="site" value="${t.url}" checked="${e === 0}">
                    ${t.name} (${t.url})
                  </uui-radio>`
    )}
            </uui-radio-group>
          </uui-form-layout-item>

          <uui-form-layout-item>
            <uui-label slot="label" for="outputFolder">Output Folder</uui-label>
            <uui-input type="text" 
              name="outputFolder"
              id="outputFolder"
              required
              class="full-width"
              placeholder="Enter output folder"
              value="${this._serverDomainData?.settings?.outputFolder || ""}"
            ></uui-input>
          </uui-form-layout-item>

          <uui-form-layout-item>
            <uui-label slot="label" for="additionalUrls">
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
            <uui-label slot="label" for="targetUrl">
              Target URL
            </uui-label>
            <uui-input type="text" 
              name="targetUrl" 
              id="targetUrl" 
              required 
              class="full-width"
              placeholder="Enter target URL"
              value="${this._serverDomainData?.settings?.targetUrl || ""}"
            ></uui-input>
          </uui-form-layout-item>
          <uui-button
            color="default"
            look="primary"
            @click="${i(this, p)}"
          >
            Export HTML
          </uui-button>
        </uui-form>
      </uui-box>
    `;
  }
};
r = /* @__PURE__ */ new WeakMap();
p = /* @__PURE__ */ new WeakMap();
n.styles = [
  E`
      :host {
        display: grid;
        gap: var(--uui-size-layout-1);
        padding: var(--uui-size-layout-1);
        grid-template-columns: 1fr 1fr 1fr;
      }

      uui-box {
        margin-bottom: var(--uui-size-layout-1);
      }

      uui-input.full-width {
        width: 100%;
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
  _()
], n.prototype, "_serverDomainData", 2);
n = y([
  U("html-exporter-dashboard")
], n);
const k = n;
export {
  n as HtmlExporterDashboardElement,
  k as default
};
//# sourceMappingURL=dashboard.element-CF4gMJSR.js.map
