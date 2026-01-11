import Header from "../../components/layout/Header/Header.tsx";
import {InputText} from "primereact/inputtext";
import {type ChangeEvent, type FormEvent, useEffect, useState} from "react";
import {Checkbox, type CheckboxChangeEvent} from "primereact/checkbox";
import {Button} from "primereact/button";
import toast from "react-hot-toast";
import {login} from "../../redux/slices/authSlice.ts";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import type {RootState} from "../../redux/store.ts";

export const RegisterPage = () => {

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const isAuthenticated = useSelector((state : RootState)=> state.auth.isAuthenticated)

    useEffect(() => {
        if (isAuthenticated)
            navigate("/")
    })

    const [formParams, setFormParams] = useState<{
        login: string;
        password: string;
        agree: boolean;
    }>({
        login: "",
        password: "",
        agree: false
    });

    const handleInputChange = (field: 'login' | 'password') => (e: ChangeEvent<HTMLInputElement>) => {
        setFormParams({
            ...formParams,
            [field]: e.target.value
        });
    };

    const handleCheckboxChange = (e: CheckboxChangeEvent) => {
        setFormParams({
            ...formParams,
            agree: e.checked!
        });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        try {
            const response = await fetch('https://itmo.ssngn.ru/lab4/api/user/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: formParams.login,
                    password: formParams.password,
                }),
            });

            const data = await response.json();

            if (response.ok && data.status === 'ok') {
                dispatch(login({username: formParams.login, token: data.token}));
                navigate('/login');
            } else {
                toast.error('Ошибка авторизации: ' + (data.message || 'Неизвестная ошибка'));
            }
        } catch (err) {
            console.error(err);
            toast.error('Сетевая ошибка');
        }
    }

    return (
        <>
            <Header/>

            <div className="row d-flex justify-content-center align-items-center mt-3">
                <div className="align-items-center col-sm-6 align-self-center d-flex flex-column">
                    <form
                        className="align-self-center d-flex flex-column align-items-center p-2"
                        onSubmit={handleSubmit}
                    >
                        <h2 className="">
                            <b>Регистрация</b>
                        </h2>

                        <InputText

                            className="mt-2 w-100"
                            type={"text"}
                            onChange={handleInputChange('login')}
                            value={formParams.login}
                            placeholder={"Логин"}

                        />

                        <InputText
                            className="mt-2  w-100"
                            type={"password"}
                            onChange={handleInputChange('password')}
                            value={formParams.password}
                            placeholder={"Пароль"}
                        />

                        <div className="d-flex flex-row align-items-center mt-2 ">
                            <Checkbox
                                inputId={"agree"}
                                checked={formParams.agree}
                                onChange={(e) => handleCheckboxChange(e)}
                                required={true}
                                invalid={!formParams.agree}
                            />
                            <label htmlFor={"agree"} className="p-2">
                                Я согласен с ФЗ "О персональных данных" от 27.07.2006 <a href={"https://www.consultant.ru/document/cons_doc_LAW_61801/"}>ссылка</a>
                            </label>

                        </div>

                        <p>Уже зарегистрированы? <a href={"/"}>Войти</a></p>

                        <Button type={"submit"} >Зарегистрироваться!</Button>
                    </form>
                </div>

            </div>
        </>
    )
}