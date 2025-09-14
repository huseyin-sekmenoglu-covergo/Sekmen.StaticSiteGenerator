import { LitElement, css, html, customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UUIButtonElement } from "@umbraco-cms/backoffice/external/uui";
import { UMB_NOTIFICATION_CONTEXT } from "@umbraco-cms/backoffice/notification";
import { UMB_CURRENT_USER_CONTEXT, UmbCurrentUserModel } from "@umbraco-cms/backoffice/current-user";
import { UmbracoCommunityHtmlExporter } from "../api/index.js";

@customElement("html-exporter-dashboard")
export class HtmlExporterDashboardElement extends UmbElementMixin(LitElement) {
 
  @state()
  private _serverUserData?: string;

  @state()
  private _contextCurrentUser?: UmbCurrentUserModel;

  #notificationContext?: typeof UMB_NOTIFICATION_CONTEXT.TYPE;

  constructor() {
    super();

    this.consumeContext(UMB_NOTIFICATION_CONTEXT, (notificationContext) => {
      this.#notificationContext = notificationContext;
    });

    this.consumeContext(UMB_CURRENT_USER_CONTEXT, (currentUserContext) => {
      // When we have the current user context
      // We can observe properties from it, such as the current user or perhaps just individual properties
      // When the currentUser object changes we will get notified and can reset the @state properrty
      this.observe(
        currentUserContext?.currentUser,
        (currentUser) => {
          this._contextCurrentUser = currentUser;
        },
        "_contextCurrentUser"
      );
    });
  }

  #exportHtml = async (ev: Event) => {
    const buttonElement = ev.target as UUIButtonElement;
    buttonElement.state = "waiting";

    const { data, error } = await UmbracoCommunityHtmlExporter.exportWebsite({
      body: {
        SiteUrl: "https://huseyinsekmenoglu.net/",
        TargetUrl: "https://huseyinsekmenoglu.net/",
        OutputFolder: "C:\\Temp\\HtmlExport"
      } 
    });

    if (error) {
      buttonElement.state = "failed";
      console.error(error);
      return;
    }

    if (data !== undefined) {
      buttonElement.state = "success";
    }

    if (this.#notificationContext) {
      this.#notificationContext.peek("warning", {
        data: {
          headline: `You are ${this._serverUserData}`,
          message: `Your email is ${this._serverUserData}`,
        },
      });
    }
  };
  // ${this._serverUserData?.groups.map(
  //   (group) => html`<li>${group.name}</li>`
  // )}

  render() {
    return html`
      <uui-box headline="Export HTML" class="wide">
        <div slot="header">[Server]</div>
        <h2>
          <uui-icon name="icon-user"></uui-icon>${this._serverUserData
            ? this._serverUserData
            : "Press the button!"}
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
          @click="${this.#exportHtml}"
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

  static styles = [
    css`
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
    `,
  ];
}

export default HtmlExporterDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "html-exporter-dashboard": HtmlExporterDashboardElement;
  }
}
