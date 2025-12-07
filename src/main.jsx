import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import GlobalStyle from "./components/GlobalStyle";
import { BrowserRouter as Router } from "react-router-dom";
import {Provider} from 'react-redux'
import { store } from "./lib/redux/store.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <Provider store={store}>
          <GlobalStyle>
        <App />
      </GlobalStyle>
      </Provider>
    </Router>
  </StrictMode>
);
