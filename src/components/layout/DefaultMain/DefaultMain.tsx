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

        if (wsRef.current) {
            wsRef.current.close();
        }

        const wsUrl = `wss://itmo.ssngn.ru/lab4/ws/points/${encodeURIComponent(token)}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("WEBSOCKET ВКЛЮЧЕН УРАААААА");
        };

        ws.onmessage = (event) => {
            try {
                const point = JSON.parse(event.data); // одна точка!
                dispatch({
                    type: 'points/addOptimisticPoint',
                    payload: {
                        id: point.id,
                        x: point.x,
                        y: point.y,
                        R: point.R,
                        inArea: point.inArea,
                        executionTime: point.executionTime,
                        timestamp: point.timestamp,
                        username: point.username,
                    },
                });
            } catch (err) {
                console.error("WEBSOCKET ERR", err);
            }
        };

        ws.onerror = (err) => {
            console.error("WEBSOCKET ERR", err);
        };

        let retryCount = 0;
        const MAX_RETRY_DELAY = 30_000; // 30 sec

        ws.onclose = (event) => {

            console.log("🔌 WEBSOCKET CLOSED", event.code, event.reason);

            const delay = Math.min(1000 * Math.pow(2, retryCount), MAX_RETRY_DELAY);
            console.log("RETRY AFTER ${delay} MS");

            setTimeout(() => {
                if (token) {
                    connectWebSocket();
                    retryCount++;
                }
            }, delay);
        };

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
