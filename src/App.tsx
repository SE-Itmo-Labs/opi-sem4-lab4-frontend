import './styles/App.scss';
import {PrimeReactProvider} from "primereact/api";

import {Routes, Route } from 'react-router-dom';

import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import {ProtectedRoute} from "./components/routes/ProtectedRoute.tsx";
import LoginPage from "./pages/LoginPage/LoginPage.tsx";
import toast, {Toaster, useToasterStore} from "react-hot-toast";
import {MainPage} from "./pages/MainPage/MainPage.tsx";
import {RegisterPage} from "./pages/RegisterPage/RegisterPage.tsx";
import {useEffect} from "react";

function App() {

    const { toasts } = useToasterStore();

    const TOAST_LIMIT = 3

    useEffect(() => {
        toasts
            .filter((t) => t.visible) // Only consider visible toasts
            .filter((_, i) => i >= TOAST_LIMIT) // Is toast index over limit?
            .forEach((t) => toast.dismiss(t.id)); // Dismiss – Use toast.remove(t.id) for no exit animation
    }, [toasts]);

    return (
    <>
        <div className="container-fluid">

            <Toaster />

            <PrimeReactProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
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
