import Header from "../../components/layout/Header/Header.tsx";
import {InputText} from "primereact/inputtext";
import {type ChangeEvent, useState} from "react";
import {Checkbox} from "primereact/checkbox";

export const RegisterPage = () => {

    const [agree, setAgree] = useState(false)

    const [formParams, setFormParams] = useState<{
        login: string;
        password: string;
        agree: boolean;
    }>({
        login: "",
        password: "",
        agree: false
    });

    const handleInputChange = (field: 'login' | 'password' | "agree") => (e: ChangeEvent<HTMLInputElement>) => {
        setFormParams({
            ...formParams,
            [field]: e.target.value
        });
    };

    return (
        <>
            <Header/>

            <div className="row d-flex justify-content-center align-items-center">
                <div className="align-items-center col-6 align-self-center d-flex flex-column">
                    <form className="align-self-center d-flex flex-column align-items-center">
                        <h2 className="">
                            <b>Регистрация</b>
                        </h2>

                        <InputText

                            type={"text"}
                            onChange={handleInputChange('login')}
                            value={formParams.login}
                            placeholder={"Логин"}

                        />

                        <InputText
                            type={"password"}
                            onChange={handleInputChange('password')}
                            value={formParams.password}
                            placeholder={"Пароль"}
                        />

                        <Checkbox
                            checked={agree}
                            value={agree}
                            onChange={(e) => {setAgree(e.value)}}
                            required={true}
                            
                        />
                    </form>
                </div>

            </div>
        </>
    )
}