import classes from "./DefaultMain.module.scss";
import {SnForm} from "../../sections/SnForm/SnForm.tsx";

import Markdown from "react-markdown";
import task from "../../../assets/markdown/task.md";

import {SnCoordsTable} from "../../sections/SnCoordsTable/SnCoordsTable.tsx";
import {SnCoordinatesCanvases} from "../../sections/SnCoordinatesCanvases/SnCoordinatesCanvases.tsx";
import {SnProfileSettings} from "../../sections/SnProfileSettings/SnProfileSettings.tsx";
import {useCallback, useEffect, useRef} from "react";
import {useDispatch, useSelector} from "react-redux";
import type {RootState} from "../../../redux/store.ts";

import type { AppDispatch } from "../../../redux/store.ts";

export const DefaultMain = () => {

    const dispatch = useDispatch<AppDispatch>();
    const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const wsRef = useRef<WebSocket | null>(null);

    const connectWebSocket = useCallback(() => {
        if (!token || wsRef.current?.readyState === WebSocket.OPEN) return;

        const wsUrl = `wss://itmo.ssngn.ru/lab4/ws/points/${token}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                // [{id, x, y, R, inArea, timestamp, executionTime, username}]
                if (Array.isArray(data)) {

                    dispatch({
                        type: 'points/updateFromWebSocket',
                        payload: data.map((p) => ({
                            id: p.id,
                            x: p.x,
                            y: p.y,
                            R: p.R,
                            inArea: p.inArea,
                            executionTime: p.executionTime,
                            timestamp: p.timestamp,
                            username: p.username,
                        })),
                    });
                }
            } catch (err) {
                console.error("Ошибка обработки WebSocket-сообщения:", err);
            }
        };

        ws.onopen = () => console.log("WebSocket подключен");
        ws.onerror = (err) => console.error("WebSocket ошибка:", err);
        ws.onclose = () => console.log("WebSocket закрыт");
    }, [token, dispatch]);

    useEffect(() => {
        if (isAuthenticated && token) {
            connectWebSocket();
        }

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [isAuthenticated, token, connectWebSocket]);

    return (
        <main className="container-fluid mt-4">
            <div className="row">
                <div className="col-lg-5 col-xl-5">
                    <section className={classes.section}>

                        <SnForm />

                    </section>
                    <section className={classes.section}>
                        <SnProfileSettings />
                    </section>
                </div>
                <div className="col-lg-7 col-xl-7">
                    <section className={classes.section}>
                        <div>
                            <SnCoordinatesCanvases />
                        </div>
                    </section>

                    <section className={classes.section}>
                        <SnCoordsTable></SnCoordsTable>
                    </section>

                    <section className={classes.section}>
                        <details open>
                            <summary>Показать задание</summary>
                            <Markdown>
                                {task}
                            </Markdown>
                        </details>
                    </section>
                </div>
            </div>
        </main>
    );
}
