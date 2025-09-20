import { LitElement, css, html, customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UUIButtonElement } from "@umbraco-cms/backoffice/external/uui";
import { UMB_NOTIFICATION_CONTEXT } from "@umbraco-cms/backoffice/notification";
import { DashboardViewModel, UmbracoCommunityHtmlExporter } from "../api/index.js";

@customElement("html-exporter-dashboard")
export class HtmlExporterDashboardElement extends UmbElementMixin(LitElement) {
 
  @state()
  private _serverDomainData?: DashboardViewModel;

  #notificationContext?: typeof UMB_NOTIFICATION_CONTEXT.TYPE;

  constructor() {
    super();

    this.consumeContext(UMB_NOTIFICATION_CONTEXT, (notificationContext) => {
      this.#notificationContext = notificationContext;
    });

    UmbracoCommunityHtmlExporter.getData()
      .then((response) => {
        this._serverDomainData = response.data;
      })
      .catch((error) => {
        console.error(error);
        if (this.#notificationContext)
          this.#notificationContext.peek("danger",  {
            data: {
              headline: `Error fetching data from server`,
              message: `See console for details`,
            },
          });
      });
  }

  #exportHtml = async (ev: Event) => {
    const buttonElement = ev.target as UUIButtonElement;
    buttonElement.state = "waiting";

    const { data, error } = await UmbracoCommunityHtmlExporter.exportWebsite({
      body: {
        SiteUrl: (this.shadowRoot?.getElementById("sourceSite") as HTMLInputElement)?.value,
        OutputFolder: (this.shadowRoot?.getElementById("outputFolder") as HTMLInputElement)?.value,
        AdditionalUrls: (this.shadowRoot?.getElementById("additionalUrls") as HTMLTextAreaElement)?.value.split('\n').map(url => url.trim()).filter(url => url.length > 0),
        TargetUrl: (this.shadowRoot?.getElementById("targetUrl") as HTMLInputElement)?.value
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
          headline: `You are`,
          message: `Your email is`,
        },
      });
    }
  };

  render() {
    return html`
      <uui-box headline="Export Settings" class="wide">
        <uui-form>
          <uui-form-layout-item>
            <uui-label for="sourceSite">Select source site</uui-label>
            <uui-radio-group name="sourceSite" id="sourceSite" required>
              ${this._serverDomainData?.domains?.map(
                (site) => html`<uui-radio id="${site.url}" name="site" value="${site.name}">
                    ${site.url}
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
                  value="${this._serverDomainData?.settings?.outputFolder || ''}"
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
              value="${this._serverDomainData?.settings?.additionalUrls.join("\n") || ''}"
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
                  value="${this._serverDomainData?.settings?.targetUrl || ''}"
            ></uui-input>
          </uui-form-layout-item>
          <uui-button
            color="default"
            look="primary"
            @click="${this.#exportHtml}"
          >
            Export HTML
          </uui-button>
        </uui-form>
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
