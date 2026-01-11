import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux';
import App from './App.tsx'
import {store} from "./redux/store.ts";
import {HashRouter} from "react-router-dom";
import {restoreAuth} from "./redux/slices/authSlice.ts";

store.dispatch(restoreAuth())

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={store} >
            <HashRouter>
                <App />
            </HashRouter>
        </Provider>
    </StrictMode>,
)