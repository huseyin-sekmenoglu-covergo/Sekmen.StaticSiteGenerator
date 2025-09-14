import { LitElement as w, html as _, css as x, state as l, customElement as C } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as T } from "@umbraco-cms/backoffice/element-api";
import { UMB_NOTIFICATION_CONTEXT as W } from "@umbraco-cms/backoffice/notification";
import { UMB_CURRENT_USER_CONTEXT as U } from "@umbraco-cms/backoffice/current-user";
import { c } from "./client.gen-TgHtDVd9.js";
class d {
  static ping(e) {
    return (e?.client ?? c).get({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/umbracocommunityhtmlexporter/api/v1/ping",
      ...e
    });
  }
  static whatsMyName(e) {
    return (e?.client ?? c).get({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/umbracocommunityhtmlexporter/api/v1/whatsMyName",
      ...e
    });
  }
  static whatsTheTimeMrWolf(e) {
    return (e?.client ?? c).get({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/umbracocommunityhtmlexporter/api/v1/whatsTheTimeMrWolf",
      ...e
    });
  }
  static whoAmI(e) {
    return (e?.client ?? c).get({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/umbracocommunityhtmlexporter/api/v1/whoAmI",
      ...e
    });
  }
}
var M = Object.defineProperty, E = Object.getOwnPropertyDescriptor, b = (t) => {
  throw TypeError(t);
}, u = (t, e, r, a) => {
  for (var o = a > 1 ? void 0 : a ? E(e, r) : e, h = t.length - 1, p; h >= 0; h--)
    (p = t[h]) && (o = (a ? p(e, r, o) : p(o)) || o);
  return a && o && M(e, r, o), o;
}, g = (t, e, r) => e.has(t) || b("Cannot " + r), s = (t, e, r) => (g(t, e, "read from private field"), r ? r.call(t) : e.get(t)), m = (t, e, r) => e.has(t) ? b("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), N = (t, e, r, a) => (g(t, e, "write to private field"), e.set(t, r), r), n, f, v, y;
let i = class extends T(w) {
  constructor() {
    super(), this._yourName = "Press the button!", m(this, n), m(this, f, async (t) => {
      const e = t.target;
      e.state = "waiting";
      const { data: r, error: a } = await d.whoAmI();
      if (a) {
        e.state = "failed", console.error(a);
        return;
      }
      r !== void 0 && (this._serverUserData = r, e.state = "success"), s(this, n) && s(this, n).peek("warning", {
        data: {
          headline: `You are ${this._serverUserData?.name}`,
          message: `Your email is ${this._serverUserData?.email}`
        }
      });
    }), m(this, v, async (t) => {
      const e = t.target;
      e.state = "waiting";
      const { data: r, error: a } = await d.whatsTheTimeMrWolf();
      if (a) {
        e.state = "failed", console.error(a);
        return;
      }
      r !== void 0 && (this._timeFromMrWolf = new Date(r), e.state = "success");
    }), m(this, y, async (t) => {
      const e = t.target;
      e.state = "waiting";
      const { data: r, error: a } = await d.whatsMyName();
      if (a) {
        e.state = "failed", console.error(a);
        return;
      }
      this._yourName = r, e.state = "success";
    }), this.consumeContext(W, (t) => {
      N(this, n, t);
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
  render() {
    return _`
      <uui-box headline="Who am I?">
        <div slot="header">[Server]</div>
        <h2>
          <uui-icon name="icon-user"></uui-icon>${this._serverUserData?.email ? this._serverUserData.email : "Press the button!"}
        </h2>
        <ul>
          ${this._serverUserData?.groups.map(
      (t) => _`<li>${t.name}</li>`
    )}
        </ul>
        <uui-button
          color="default"
          look="primary"
          @click="${s(this, f)}"
        >
          Who am I?
        </uui-button>
        <p>
          This endpoint gets your current user from the server and displays your
          email and list of user groups. It also displays a Notification with
          your details.
        </p>
      </uui-box>

      <uui-box headline="What's my Name?">
        <div slot="header">[Server]</div>
        <h2><uui-icon name="icon-user"></uui-icon> ${this._yourName}</h2>
        <uui-button
          color="default"
          look="primary"
          @click="${s(this, y)}"
        >
          Whats my name?
        </uui-button>
        <p>
          This endpoint has a forced delay to show the button 'waiting' state
          for a few seconds before completing the request.
        </p>
      </uui-box>

      <uui-box headline="What's the Time?">
        <div slot="header">[Server]</div>
        <h2>
          <uui-icon name="icon-alarm-clock"></uui-icon> ${this._timeFromMrWolf ? this._timeFromMrWolf.toLocaleString() : "Press the button!"}
        </h2>
        <uui-button
          color="default"
          look="primary"
          @click="${s(this, v)}"
        >
          Whats the time Mr Wolf?
        </uui-button>
        <p>This endpoint gets the current date and time from the server.</p>
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
n = /* @__PURE__ */ new WeakMap();
f = /* @__PURE__ */ new WeakMap();
v = /* @__PURE__ */ new WeakMap();
y = /* @__PURE__ */ new WeakMap();
i.styles = [
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
u([
  l()
], i.prototype, "_yourName", 2);
u([
  l()
], i.prototype, "_timeFromMrWolf", 2);
u([
  l()
], i.prototype, "_serverUserData", 2);
u([
  l()
], i.prototype, "_contextCurrentUser", 2);
i = u([
  C("example-dashboard")
], i);
const S = i;
export {
  i as ExampleDashboardElement,
  S as default
};
//# sourceMappingURL=dashboard.element-DjxGafqx.js.map
