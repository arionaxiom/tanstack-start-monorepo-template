import { Trans } from "@lingui/react/macro";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";

import { render } from "@__APP_NAME__/ui/test-utils";

function TranslatedMessage() {
  return (
    <p>
      <Trans>The page you are looking for does not exist.</Trans>
    </p>
  );
}

describe("Lingui i18n integration", () => {
  it("renders translated text through I18nProvider", async () => {
    await render(<TranslatedMessage />);
    await expect
      .element(page.getByText("The page you are looking for does not exist."))
      .toBeInTheDocument();
  });
});
