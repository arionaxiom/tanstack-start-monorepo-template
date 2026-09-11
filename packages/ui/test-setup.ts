import { i18n } from "@lingui/core";

import { messages } from "@__APP_NAME__/locale/locales/en";
import "@__APP_NAME__/tailwind-config/shared-styles.css";

i18n.loadAndActivate({ locale: "en", messages });
