import {Dropdown} from "primereact/dropdown";

import classes from "./SnForm.module.scss";
import {Slider} from "primereact/slider";
import {Button} from "primereact/button";
import type {RootState} from "../../../redux/store.ts";
import {useDispatch, useSelector} from "react-redux";
import {setR, setX, setY} from "../../../redux/slices/formSlice.ts";
import {logout} from "../../../redux/slices/authSlice.ts";
import toast from "react-hot-toast";
import {addOptimisticPoint, fetchAllPoints, type Point2DRow} from "../../../redux/slices/pointsSlice.ts";
import {useState} from "react";

export const SnForm = () => {
    const dispatch = useDispatch();
    const token = useSelector((state: RootState) => state.auth.token);
    const data = {
        x: useSelector((state: RootState) => state.form.x),
        y: useSelector((state: RootState) => state.form.y),
        r: useSelector((state: RootState) => state.form.r),
    };

    const [tempIdCounter, setTempIdCounter] = useState(-2281337);

    const rValues = ["0.5", "1", "1.5", "2"];

    const xValues = ["-2", "-1.5", "-1", "0", "0.5", "1", "1.5", "2"]

    const submitPoint = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            toast.error("Вы не авторизованы!");
            return;
        }

        const x = parseFloat(data.x);
        const y = parseFloat(data.y);
        const r = parseFloat(data.r);

        if (isNaN(x) || isNaN(y) || isNaN(r)) {
            toast.error("Некорректные координаты");
            return;
        }

        if (y < -3 || y > 5) {
            toast.error("Y должен быть от -3 до 5");
            return;
        }

        if (!rValues.includes(data.r)) {
            toast.error("Недопустимый радиус");
            return;
        }

        const optimisticPoint: Point2DRow = {
            id: tempIdCounter,
            x: parseFloat(x.toFixed(3)),
            y: parseFloat(y.toFixed(3)),
            R: r,
            inArea: false,
            executionTime: 0,
            timestamp: new Date().toISOString(),
            username: "unknown",
        };

        setTempIdCounter(tempIdCounter-1);

        dispatch(addOptimisticPoint(optimisticPoint));

        try {
            const response = await fetch('https://itmo.ssngn.ru/lab4/api/point/save/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'snAuthToken': token,
                },
                body: JSON.stringify({
                    x: data.x,
                    y: data.y,
                    R: data.r,
                }),
            });

            const result = await response.json();

            if (response.status === 401) {
                dispatch(logout());
                toast.error("Сессия истекла. Войдите снова.");
                return;
            }

            if (!response.ok) {
                toast.error(result.message || "Ошибка отправки точки");
                return;
            }

            toast.success("Точка отправлена!");

            // @ts-ignore
            dispatch(fetchAllPoints(token!));
        } catch (err) {
            console.error(err);
            toast.error("Не удалось отправить точку");
        }
    };

    return (
        <form onSubmit={submitPoint} className={classes.form + " d-flex flex-column justify-content-start p-3"}>
            <div>
                <h2><b>Отправить точку в полёт</b></h2>
            </div>

            <label>Значение X</label>

            <Dropdown
                value={data.x}
                onChange={(e) => dispatch(setX(String(e.value)))}
                options={xValues}
                placeholder={"Выберите x"}
            />

            <label>Значение Y: {data.y}</label>

            <Slider
                value={Number(data.y)}
                min={-2}
                max={2}
                step={0.001}
                onChange={(e) => {
                    dispatch(setY(String(e.value)));
                }}
            />

            <label>Значение R</label>

            <Dropdown
                value={data.r}
                onChange={(e) => dispatch(setR(String(e.value)))}
                options={rValues}
                placeholder={"Выберите радиус"}
            />

            <Button type={"submit"} label={"Бросить точку"} />
            {/*<Button severity={'warning'} type={"submit"} label={"Бросить супер-точку!"} />*/}
        </form>
    )
}