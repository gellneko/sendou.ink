import React from "react"
import ReactDOM from "react-dom"
import App from "./components/root/App"
import {
  ThemeProvider,
  ColorModeProvider,
  CSSReset,
  theme,
} from "@chakra-ui/core"
import { ApolloProvider } from "@apollo/react-hooks"
import { QueryParamProvider } from "use-query-params"
import { HelmetProvider } from "react-helmet-async"
import { LocationProvider, createHistory } from "@reach/router"
import * as Sentry from "@sentry/react"
import ApolloClient from "apollo-boost"
import * as serviceWorker from "./serviceWorker"
import customIcons from "./assets/icons"
import "./i18n"

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn:
      "https://fbdedefb54744b33aa0450f1f9f52ee9@o443322.ingest.sentry.io/5416867",
  })
}

const client = new ApolloClient({
  uri:
    process.env.NODE_ENV === "production"
      ? "/graphql"
      : "http://localhost:3001/graphql",
})

const customTheme = { ...theme, icons: { ...theme.icons, ...customIcons } }

let history = createHistory(window as any)

ReactDOM.render(
  <LocationProvider history={history}>
    <QueryParamProvider reachHistory={history}>
      <HelmetProvider>
        <ApolloProvider client={client}>
          <ThemeProvider theme={customTheme}>
            <ColorModeProvider>
              <CSSReset />
              <App />
            </ColorModeProvider>
          </ThemeProvider>
        </ApolloProvider>
      </HelmetProvider>
    </QueryParamProvider>
  </LocationProvider>,
  document.getElementById("root")
)

serviceWorker.unregister()
