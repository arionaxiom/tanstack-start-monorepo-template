import { Trans } from "@lingui/react/macro";
import { describe, expect, it } from "vitest";

import { render, screen } from "../test-utils";

function TranslatedMessage() {
  return (
    <p>
      <Trans>The page you are looking for does not exist.</Trans>
    </p>
  );
}

describe("Lingui i18n integration", () => {
  it("renders translated text through I18nProvider", () => {
    render(<TranslatedMessage />);
    expect(
      screen.getByText("The page you are looking for does not exist.")
    ).toBeInTheDocument();
  });
});
