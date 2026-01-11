import Header from "../../components/layout/Header/Header.tsx";
import {useState, type FormEvent, type ChangeEvent, useEffect} from "react";
import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";
import {login} from "../../redux/slices/authSlice.ts";
import {useDispatch, useSelector} from "react-redux";
import {Link, useNavigate} from "react-router-dom";
import toast from "react-hot-toast";
import type {RootState} from "../../redux/store.ts";

function LoginPage() {

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/")
        }
    })

    const [formParams, setFormParams] = useState<{
        login: string;
        password: string;
    }>({
        login: "",
        password: ""
    });

    const handleInputChange = (field: 'login' | 'password') => (e: ChangeEvent<HTMLInputElement>) => {
        setFormParams({
            ...formParams,
            [field]: e.target.value
        });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await fetch('https://itmo.ssngn.ru/lab4/api/user/auth/', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    username: formParams.login,
                    password: formParams.password,
                }),
            });

            const data = await response.json();

            if (response.ok && data.status === 'ok' && data.token) {
                dispatch(login({username: formParams.login, token: data.token}));
                navigate('/'); // редирект на main
            } else {
                toast.error('Ошибка авторизации: ' + (data.message || 'Неизвестная ошибка'));
            }
        } catch (err) {
            console.error(err);
            toast.error('Сетевая ошибка');
        }
    };

    return (
        <>
            <Header />

            <div className="row d-flex justify-content-center align-items-center mt-3">
                <div className="align-items-center col-sm-6 align-self-center d-flex flex-column">
                    <form
                        className="align-self-center d-flex flex-column align-items-center p-2"
                        onSubmit={handleSubmit}
                    >
                        <h2 className=""><b>Войти</b></h2>

                        <InputText
                            className="mt-2 w-100"
                        type={"text"}
                        onChange={handleInputChange('login')}
                        value={formParams.login}
                        placeholder={"Логин"}

                        />

                        <InputText

                            className="mt-2 w-100"

                            type={"password"}
                            onChange={handleInputChange('password')}
                            value={formParams.password}
                            placeholder={"Пароль"}
                        />

                        <p className={"mt-2"}>Нет в системе? <Link to={"/register"}>Зарегистрироваться</Link></p>

                        <Button className={"mt-1"} type={"submit"} label={"Войти уже наконец-то!"} />

                    </form>
                </div>
            </div>
        </>
    );
}

export default LoginPage;
