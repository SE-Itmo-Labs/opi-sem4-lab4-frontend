import './styles/App.scss';
import {PrimeReactProvider} from "primereact/api";

import {Routes, Route } from 'react-router-dom';

import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import {ProtectedRoute} from "./components/routes/ProtectedRoute.tsx";
import LoginPage from "./pages/LoginPage/LoginPage.tsx";
import {Toaster} from "react-hot-toast";
import {MainPage} from "./pages/MainPage/MainPage.tsx";

function App() {

    return (
    <>
        <div className="container-fluid">

            <Toaster />

            <PrimeReactProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path={"/"} element={<MainPage />} />
                    </Route>
                    <Route path={"*"} element={<ProtectedRoute />} />
                </Routes>
            </PrimeReactProvider>
        </div>
    </>
    )
}

export default App;
