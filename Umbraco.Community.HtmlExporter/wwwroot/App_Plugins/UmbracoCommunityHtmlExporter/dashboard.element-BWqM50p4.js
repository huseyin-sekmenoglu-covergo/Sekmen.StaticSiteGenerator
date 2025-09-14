import { LitElement as f, html as b, css as _, state as d, customElement as y } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as x } from "@umbraco-cms/backoffice/element-api";
import { UMB_NOTIFICATION_CONTEXT as g } from "@umbraco-cms/backoffice/notification";
import { UMB_CURRENT_USER_CONTEXT as U } from "@umbraco-cms/backoffice/current-user";
import { c as C, f as E } from "./client.gen-Cs-igdZt.js";
class T {
  static exportWebsite(e) {
    return (e?.client ?? C).post({
      ...E,
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
}
var w = Object.defineProperty, O = Object.getOwnPropertyDescriptor, h = (t) => {
  throw TypeError(t);
}, c = (t, e, r, s) => {
  for (var a = s > 1 ? void 0 : s ? O(e, r) : e, l = t.length - 1, n; l >= 0; l--)
    (n = t[l]) && (a = (s ? n(e, r, a) : n(a)) || a);
  return s && a && w(e, r, a), a;
}, v = (t, e, r) => e.has(t) || h("Cannot " + r), u = (t, e, r) => (v(t, e, "read from private field"), r ? r.call(t) : e.get(t)), m = (t, e, r) => e.has(t) ? h("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), D = (t, e, r, s) => (v(t, e, "write to private field"), e.set(t, r), r), o, p;
let i = class extends x(f) {
  constructor() {
    super(), m(this, o), m(this, p, async (t) => {
      const e = t.target;
      e.state = "waiting";
      const { data: r, error: s } = await T.exportWebsite({
        body: {
          SiteUrl: "https://huseyinsekmenoglu.net/",
          TargetUrl: "https://huseyinsekmenoglu.net/",
          OutputFolder: "C:\\Temp\\HtmlExport"
        }
      });
      if (s) {
        e.state = "failed", console.error(s);
        return;
      }
      r !== void 0 && (e.state = "success"), u(this, o) && u(this, o).peek("warning", {
        data: {
          headline: `You are ${this._serverUserData}`,
          message: `Your email is ${this._serverUserData}`
        }
      });
    }), this.consumeContext(g, (t) => {
      D(this, o, t);
    }), this.consumeContext(U, (t) => {
      this.observe(
        t?.currentUser,
        (e) => {
          this._contextCurrentUser = e;
        },
        "_contextCurrentUser"
      );
    });
  }
  // ${this._serverUserData?.groups.map(
  //   (group) => html`<li>${group.name}</li>`
  // )}
  render() {
    return b`
      <uui-box headline="Export HTML" class="wide">
        <div slot="header">[Server]</div>
        <h2>
          <uui-icon name="icon-user"></uui-icon>${this._serverUserData ? this._serverUserData : "Press the button!"}
        </h2>
        <div class="form-group mb-3">
          <label for="siteUrl" class="form-label">Select source site</label> 
          <ul>
            <li>
            <input type="radio" id="site1" name="site" value="site1" checked>
              <label for="site1">https://huseyinsekmenoglu.net/</label>
            </li>
            <li>
              <input type="radio" id="site2" name="site" value="site2">
              <label for="site2">https://example.com/</label>
            </li>
          </ul>
        </div>

        <div class="form-group mb-3">
          <label for="targetUrl" class="form-label">Target URL</label>
            <input type="text" 
                   name="targetUrl" 
                   id="targetUrl" 
                   class="form-control" 
                   required 
                   placeholder="Enter target URL"
                   aria-label="Target URL"
                   value="https://huseyinsekmenoglu.net/">
        </div>
        <uui-button
          color="default"
          look="primary"
          @click="${u(this, p)}"
        >
          Export HTML
        </uui-button>
        <p>
          This endpoint gets your current user from the server and displays your
          email and list of user groups. It also displays a Notification with
          your details.
        </p>
      </uui-box>


      <uui-box headline="Who am I?" class="wide">
        <div slot="header">[Context]</div>
        <p>Current user email: <b>${this._contextCurrentUser?.email}</b></p>
        <p>
          This is the JSON object available by consuming the
          'UMB_CURRENT_USER_CONTEXT' context:
        </p>
        <umb-code-block language="json" copy
          >${JSON.stringify(this._contextCurrentUser, null, 2)}</umb-code-block
        >
      </uui-box>
    `;
  }
};
o = /* @__PURE__ */ new WeakMap();
p = /* @__PURE__ */ new WeakMap();
i.styles = [
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
c([
  d()
], i.prototype, "_serverUserData", 2);
c([
  d()
], i.prototype, "_contextCurrentUser", 2);
i = c([
  y("html-exporter-dashboard")
], i);
const H = i;
export {
  i as HtmlExporterDashboardElement,
  H as default
};
//# sourceMappingURL=dashboard.element-BWqM50p4.js.map
