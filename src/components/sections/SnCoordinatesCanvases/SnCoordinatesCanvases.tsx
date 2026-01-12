import {SnCanvas} from '../../ui/canvas/SnCanvas';
import {useDispatch, useSelector} from "react-redux";
import type {AppDispatch, RootState} from "../../../redux/store.ts";
import classes from "./SnCoordinatesCanvases.module.scss";
import {Dropdown} from "primereact/dropdown";
import {useEffect, useState} from "react";
import {
    fetchAllPoints,
    type Point2DRow,
    addOptimisticPoint,
    deleteAllMyPoints
} from "../../../redux/slices/pointsSlice.ts";

import stars from "../../../assets/images/skins/stars.png";
import russia from "../../../assets/images/skins/russia.jpg";
import nostalgia from "../../../assets/images/skins/nostalgia.jpeg";
import null_ from "../../../assets/images/skins/null.png";
import {logout} from "../../../redux/slices/authSlice.ts";
import toast from "react-hot-toast";
import {Button} from "primereact/button";


const SKINS = [
    { label: "Безмятежность", value: nostalgia },
    { label: "Звёзды", value: stars },
    { label: "Россия-матушка", value: russia },
    {label: "Ничего", value: null_}
];

// const fetchPoints = async (token: string): Promise<SnPoint[]> => {
//     const res = await fetch('https://itmo.ssngn.ru/lab4/api/point/all', {
//         method: "GET",
//         headers: {
//             'snAuthToken': token,
//         },
//     });
//     if (!res.ok) throw new Error('Failed to fetch points');
//
//     const json = await res.json();
//     console.log("ALL DATA", json)
//
//     return json.data.map((p: any) => ({
//         x: p.x,
//         y: p.y,
//         hit: p.inArea,
//     }));
// };

export const SnCoordinatesCanvases = () => {

    const [selectedSkin, setSelectedSkin] = useState<string>(null_);


    const [tempIdCounter, setTempIdCounter] = useState(-2281337);

    const dispatch = useDispatch<AppDispatch>()

    const { token } = useSelector((state: RootState) => state.auth);
    const currentRadius = useSelector((state: RootState) => state.form.r);
    const allPoints = useSelector((state: RootState) => state.points.data);

    const radii = [0.5, 1, 1.5, 2];

    useEffect(() => {
        if (token) dispatch(fetchAllPoints(token));
        else {
            toast.error("Вы не авторизованы!");
        }
    }, [dispatch, token]);

    const handleDeleteAllPointsClick = async () => {
        if (!token) {
            toast.error("Вы не авторизованы!");
        }

        try {
            await dispatch(deleteAllMyPoints(token!)).unwrap();
            toast.success("Да запросто! :)");

            dispatch(fetchAllPoints(token!));
        } catch (err) {
            console.error(err);
            toast.error("Не удалось удалить точки");
        }
    };

    const handleCanvasClick = async (point: { x: number; y: number; r: number }) => {

        if (!token) {
            toast.error("Вы не авторизованы");
            return;
        }

        const { x, y, r } = point;

        if (y < -3 || y > 5) {
            toast.error("Y должен быть от -3 до 5");
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
                    x: x.toFixed(3),
                    y: y.toFixed(3),
                    R: r,
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

            toast.success("Точка добавлена!");
            dispatch(fetchAllPoints(token));
        } catch (err) {
            console.error(err);
            toast.error("Не удалось отправить точку");
        }
    };

    return (
        <>
            <div className={classes.canvases + " row"}>
                <div className={"col-xl-8"}>

                    {radii.map(r => {
                        const filtered = allPoints.filter(p => p.R === r);
                        return (
                            <div key={r} className="mb-4" hidden={r !== Number(currentRadius)}>
                                <h5>Радиус: {r}</h5>
                                <SnCanvas
                                    r={r}
                                    backgroundImage={selectedSkin}
                                    points={filtered.map(p => ({
                                        x: p.x,
                                        y: p.y,
                                        hit: p.inArea,
                                        user_id: p.id
                                    }))}
                                    onPointClick={(point) => handleCanvasClick({ ...point, r })}
                                />
                            </div>
                        );
                    })}
                </div>
                <div className={"col-xl-4"}>
                    <h3><b>Скины:</b></h3>
                    <Dropdown
                        value={selectedSkin}
                        options={SKINS}
                        onChange={(e) => setSelectedSkin(e.value as string)}
                        optionLabel="label"
                        placeholder="Выберите скин"
                    />
                    <br />
                    <h4 className={"mt-5"}><b>Действия</b></h4>
                    <Button onClick={handleDeleteAllPointsClick} severity={"success"}>Удалить все точки</Button>
                </div>
            </div>
        </>
    )
}

