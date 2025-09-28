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

    var siteUrl = (this.shadowRoot?.getElementById("sourceSite") as HTMLInputElement)?.value;
    var outputFolder = (this.shadowRoot?.getElementById("outputFolder") as HTMLInputElement)?.value;
    var additionalUrls = (this.shadowRoot?.getElementById("additionalUrls") as HTMLTextAreaElement)?.value;
    var targetUrl = (this.shadowRoot?.getElementById("targetUrl") as HTMLInputElement)?.value;
    var stringReplacementsText = (this.shadowRoot?.getElementById("stringReplacements") as HTMLTextAreaElement)?.value;
    if (!siteUrl) {
      buttonElement.state = "failed";
      if (this.#notificationContext) {
        this.#notificationContext.peek("danger", {
          data: {
            headline: `Error`,
            message: `Please select a valid source site URL`,
          },
        });
      }
      return;
    }
    if (!outputFolder) {
      buttonElement.state = "failed";
      if (this.#notificationContext) {
        this.#notificationContext.peek("danger", {
          data: {
            headline: `Error`,
            message: `Please enter a valid output folder`,
          },
        });
      }
      return;
    }
    if (!targetUrl) {
      buttonElement.state = "failed";
      if (this.#notificationContext) {
        this.#notificationContext.peek("danger", {
          data: {
            headline: `Error`,
            message: `Please enter a valid target URL`,
          },
        });
      }
      return;
    }

    if (!targetUrl.endsWith("/")) {
      targetUrl += "/";
    }
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "http://" + targetUrl;
    }

    // Process string replacements
    const stringReplacements = stringReplacementsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && line.includes('|'))
      .map(line => {
        const [oldValue, newValue] = line.split('|', 2);
        return { oldValue: oldValue.trim(), newValue: newValue?.trim() || '' };
      });

    // Create properly formatted form data for ASP.NET Core model binding
    const requestBody: any = {
      SiteUrl: siteUrl,
      OutputFolder: outputFolder,
      TargetUrl: targetUrl,
      AdditionalUrls: additionalUrls.split('\n').map(url => url.trim()).filter(url => url.length > 0)
    };

    // Add string replacements with proper indexing for ASP.NET Core
    stringReplacements.forEach((replacement, index) => {
      requestBody[`StringReplacements[${index}].OldValue`] = replacement.oldValue;
      requestBody[`StringReplacements[${index}].NewValue`] = replacement.newValue;
    });

    const { data, error } = await UmbracoCommunityHtmlExporter.exportWebsite({
      body: requestBody
    });

    if (error) {
      buttonElement.state = "failed";
      console.error(error);
      if (this.#notificationContext) {
        this.#notificationContext.peek("danger", {
          data: {
            headline: `Export failed`,
            message: `An error occurred during export. See console for details.`,
          },
        });
      }
      return;
    }

    if (data !== undefined) {
      buttonElement.state = "success";
        if (this.#notificationContext) {
          this.#notificationContext.peek("positive", {
            data: {
              headline: `Export finished`,
              message: `The HTML export has been finished successfully.`,
            },
          });
        }
    }

    setTimeout(() => {
      buttonElement.state = "success";
    }, 2000);
  };

  render() {
    return html`
      <uui-box headline="Export Settings" class="wide">
        <uui-form>
          <uui-form-layout-item>
            <uui-label slot="label" for="sourceSite">Select source site</uui-label>
            <uui-radio-group name="sourceSite" id="sourceSite" required role="radiogroup">
              ${this._serverDomainData?.domains?.map(
                (site, index) => html`<uui-radio name="site" value="${site.url}" checked="${index === 0}">
                    ${site.name} (${site.url})
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
              value="${this._serverDomainData?.settings?.outputFolder || ''}"
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
              value="${this._serverDomainData?.settings?.additionalUrls.join("\n") || ''}"
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
              value="${this._serverDomainData?.settings?.targetUrl || ''}"
            ></uui-input>
          </uui-form-layout-item>

          <uui-form-layout-item>
            <uui-label slot="label" for="stringReplacements">
              String Replacements (Format: oldValue|newValue, one per line)
            </uui-label>
            <uui-textarea
              name="stringReplacements"
              id="stringReplacements"
              placeholder="Enter string replacements (format: oldValue|newValue, one per line)"
              rows="5"
              value="${this._serverDomainData?.settings?.stringReplacements?.map((sr: any) => `${sr.oldValue}|${sr.newValue}`).join('\n') || ''}"
            ></uui-textarea>
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

      uui-input.full-width {
        width: 100%;
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
