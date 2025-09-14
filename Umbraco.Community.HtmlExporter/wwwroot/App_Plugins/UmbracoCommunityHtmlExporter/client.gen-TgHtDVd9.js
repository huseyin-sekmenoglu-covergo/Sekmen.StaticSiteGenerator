var R = async (t, s) => {
  let r = typeof s == "function" ? await s(t) : s;
  if (r) return t.scheme === "bearer" ? `Bearer ${r}` : t.scheme === "basic" ? `Basic ${btoa(r)}` : r;
}, C = { bodySerializer: (t) => JSON.stringify(t, (s, r) => typeof r == "bigint" ? r.toString() : r) }, _ = (t) => {
  switch (t) {
    case "label":
      return ".";
    case "matrix":
      return ";";
    case "simple":
      return ",";
    default:
      return "&";
  }
}, U = (t) => {
  switch (t) {
    case "form":
      return ",";
    case "pipeDelimited":
      return "|";
    case "spaceDelimited":
      return "%20";
    default:
      return ",";
  }
}, I = (t) => {
  switch (t) {
    case "label":
      return ".";
    case "matrix":
      return ";";
    case "simple":
      return ",";
    default:
      return "&";
  }
}, j = ({ allowReserved: t, explode: s, name: r, style: o, value: n }) => {
  if (!s) {
    let e = (t ? n : n.map((i) => encodeURIComponent(i))).join(U(o));
    switch (o) {
      case "label":
        return `.${e}`;
      case "matrix":
        return `;${r}=${e}`;
      case "simple":
        return e;
      default:
        return `${r}=${e}`;
    }
  }
  let l = _(o), a = n.map((e) => o === "label" || o === "simple" ? t ? e : encodeURIComponent(e) : b({ allowReserved: t, name: r, value: e })).join(l);
  return o === "label" || o === "matrix" ? l + a : a;
}, b = ({ allowReserved: t, name: s, value: r }) => {
  if (r == null) return "";
  if (typeof r == "object") throw new Error("Deeply-nested arrays/objects aren’t supported. Provide your own `querySerializer()` to handle these.");
  return `${s}=${t ? r : encodeURIComponent(r)}`;
}, x = ({ allowReserved: t, explode: s, name: r, style: o, value: n }) => {
  if (n instanceof Date) return `${r}=${n.toISOString()}`;
  if (o !== "deepObject" && !s) {
    let e = [];
    Object.entries(n).forEach(([c, d]) => {
      e = [...e, c, t ? d : encodeURIComponent(d)];
    });
    let i = e.join(",");
    switch (o) {
      case "form":
        return `${r}=${i}`;
      case "label":
        return `.${i}`;
      case "matrix":
        return `;${r}=${i}`;
      default:
        return i;
    }
  }
  let l = I(o), a = Object.entries(n).map(([e, i]) => b({ allowReserved: t, name: o === "deepObject" ? `${r}[${e}]` : e, value: i })).join(l);
  return o === "label" || o === "matrix" ? l + a : a;
}, T = /\{[^{}]+\}/g, A = ({ path: t, url: s }) => {
  let r = s, o = s.match(T);
  if (o) for (let n of o) {
    let l = !1, a = n.substring(1, n.length - 1), e = "simple";
    a.endsWith("*") && (l = !0, a = a.substring(0, a.length - 1)), a.startsWith(".") ? (a = a.substring(1), e = "label") : a.startsWith(";") && (a = a.substring(1), e = "matrix");
    let i = t[a];
    if (i == null) continue;
    if (Array.isArray(i)) {
      r = r.replace(n, j({ explode: l, name: a, style: e, value: i }));
      continue;
    }
    if (typeof i == "object") {
      r = r.replace(n, x({ explode: l, name: a, style: e, value: i }));
      continue;
    }
    if (e === "matrix") {
      r = r.replace(n, `;${b({ name: a, value: i })}`);
      continue;
    }
    let c = encodeURIComponent(e === "label" ? `.${i}` : i);
    r = r.replace(n, c);
  }
  return r;
}, $ = ({ allowReserved: t, array: s, object: r } = {}) => (o) => {
  let n = [];
  if (o && typeof o == "object") for (let l in o) {
    let a = o[l];
    if (a != null) if (Array.isArray(a)) {
      let e = j({ allowReserved: t, explode: !0, name: l, style: "form", value: a, ...s });
      e && n.push(e);
    } else if (typeof a == "object") {
      let e = x({ allowReserved: t, explode: !0, name: l, style: "deepObject", value: a, ...r });
      e && n.push(e);
    } else {
      let e = b({ allowReserved: t, name: l, value: a });
      e && n.push(e);
    }
  }
  return n.join("&");
}, z = (t) => {
  if (!t) return "stream";
  let s = t.split(";")[0]?.trim();
  if (s) {
    if (s.startsWith("application/json") || s.endsWith("+json")) return "json";
    if (s === "multipart/form-data") return "formData";
    if (["application/", "audio/", "image/", "video/"].some((r) => s.startsWith(r))) return "blob";
    if (s.startsWith("text/")) return "text";
  }
}, E = async ({ security: t, ...s }) => {
  for (let r of t) {
    let o = await R(r, s.auth);
    if (!o) continue;
    let n = r.name ?? "Authorization";
    switch (r.in) {
      case "query":
        s.query || (s.query = {}), s.query[n] = o;
        break;
      case "cookie":
        s.headers.append("Cookie", `${n}=${o}`);
        break;
      case "header":
      default:
        s.headers.set(n, o);
        break;
    }
    return;
  }
}, g = (t) => W({ baseUrl: t.baseUrl, path: t.path, query: t.query, querySerializer: typeof t.querySerializer == "function" ? t.querySerializer : $(t.querySerializer), url: t.url }), W = ({ baseUrl: t, path: s, query: r, querySerializer: o, url: n }) => {
  let l = n.startsWith("/") ? n : `/${n}`, a = (t ?? "") + l;
  s && (a = A({ path: s, url: a }));
  let e = r ? o(r) : "";
  return e.startsWith("?") && (e = e.substring(1)), e && (a += `?${e}`), a;
}, v = (t, s) => {
  let r = { ...t, ...s };
  return r.baseUrl?.endsWith("/") && (r.baseUrl = r.baseUrl.substring(0, r.baseUrl.length - 1)), r.headers = S(t.headers, s.headers), r;
}, S = (...t) => {
  let s = new Headers();
  for (let r of t) {
    if (!r || typeof r != "object") continue;
    let o = r instanceof Headers ? r.entries() : Object.entries(r);
    for (let [n, l] of o) if (l === null) s.delete(n);
    else if (Array.isArray(l)) for (let a of l) s.append(n, a);
    else l !== void 0 && s.set(n, typeof l == "object" ? JSON.stringify(l) : l);
  }
  return s;
}, w = class {
  _fns;
  constructor() {
    this._fns = [];
  }
  clear() {
    this._fns = [];
  }
  getInterceptorIndex(t) {
    return typeof t == "number" ? this._fns[t] ? t : -1 : this._fns.indexOf(t);
  }
  exists(t) {
    let s = this.getInterceptorIndex(t);
    return !!this._fns[s];
  }
  eject(t) {
    let s = this.getInterceptorIndex(t);
    this._fns[s] && (this._fns[s] = null);
  }
  update(t, s) {
    let r = this.getInterceptorIndex(t);
    return this._fns[r] ? (this._fns[r] = s, t) : !1;
  }
  use(t) {
    return this._fns = [...this._fns, t], this._fns.length - 1;
  }
}, D = () => ({ error: new w(), request: new w(), response: new w() }), N = $({ allowReserved: !1, array: { explode: !0, style: "form" }, object: { explode: !0, style: "deepObject" } }), k = { "Content-Type": "application/json" }, q = (t = {}) => ({ ...C, headers: k, parseAs: "auto", querySerializer: N, ...t }), P = (t = {}) => {
  let s = v(q(), t), r = () => ({ ...s }), o = (a) => (s = v(s, a), r()), n = D(), l = async (a) => {
    let e = { ...s, ...a, fetch: a.fetch ?? s.fetch ?? globalThis.fetch, headers: S(s.headers, a.headers) };
    e.security && await E({ ...e, security: e.security }), e.body && e.bodySerializer && (e.body = e.bodySerializer(e.body)), (e.body === void 0 || e.body === "") && e.headers.delete("Content-Type");
    let i = g(e), c = { redirect: "follow", ...e }, d = new Request(i, c);
    for (let f of n.request._fns) f && (d = await f(d, e));
    let O = e.fetch, u = await O(d);
    for (let f of n.response._fns) f && (u = await f(u, d, e));
    let y = { request: d, response: u };
    if (u.ok) {
      if (u.status === 204 || u.headers.get("Content-Length") === "0") return e.responseStyle === "data" ? {} : { data: {}, ...y };
      let f = (e.parseAs === "auto" ? z(u.headers.get("Content-Type")) : e.parseAs) ?? "json";
      if (f === "stream") return e.responseStyle === "data" ? u.body : { data: u.body, ...y };
      let h = await u[f]();
      return f === "json" && (e.responseValidator && await e.responseValidator(h), e.responseTransformer && (h = await e.responseTransformer(h))), e.responseStyle === "data" ? h : { data: h, ...y };
    }
    let m = await u.text();
    try {
      m = JSON.parse(m);
    } catch {
    }
    let p = m;
    for (let f of n.error._fns) f && (p = await f(m, u, d, e));
    if (p = p || {}, e.throwOnError) throw p;
    return e.responseStyle === "data" ? void 0 : { error: p, ...y };
  };
  return { buildUrl: g, connect: (a) => l({ ...a, method: "CONNECT" }), delete: (a) => l({ ...a, method: "DELETE" }), get: (a) => l({ ...a, method: "GET" }), getConfig: r, head: (a) => l({ ...a, method: "HEAD" }), interceptors: n, options: (a) => l({ ...a, method: "OPTIONS" }), patch: (a) => l({ ...a, method: "PATCH" }), post: (a) => l({ ...a, method: "POST" }), put: (a) => l({ ...a, method: "PUT" }), request: l, setConfig: o, trace: (a) => l({ ...a, method: "TRACE" }) };
};
const H = P(q({
  baseUrl: "https://localhost:44389"
}));
export {
  H as c
};
//# sourceMappingURL=client.gen-TgHtDVd9.js.map
