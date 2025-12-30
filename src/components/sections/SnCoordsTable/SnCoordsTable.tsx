import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {useDispatch, useSelector} from "react-redux";
import type {AppDispatch, RootState} from "../../../redux/store.ts";
import {Button} from "primereact/button";
import type {Point2DRow} from "../../../redux/slices/pointsSlice.ts";
import toast from "react-hot-toast";

import { deletePoint, fetchAllPoints } from "../../../redux/slices/pointsSlice.ts";

export const SnCoordsTable = () => {
    const points = useSelector((state: RootState) => state.points.data);
    const myUsername = useSelector((state: RootState) => state.auth.username);

    const { token } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();


    const isMyPoint = (username: string) => username === myUsername;

    const actionBodyTemplate = (rowData: Point2DRow) => {
        if (!isMyPoint(rowData.username)) return null;
        return (
            <Button
                icon="pi pi-trash"
                severity="danger"
                rounded
                onClick={async () => {
                    if (!token) return;
                    try {
                        await dispatch(deletePoint({ id: rowData.id, token })).unwrap();
                        dispatch(fetchAllPoints(token)); // или полагаться на WebSocket
                        toast.success("Точка удалена");
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    } catch (_:unknown) {
                        toast.error("Не удалось удалить точку");
                    }
                }}
            />
        );
    };

    return (
        <>
            <DataTable value={points} paginator rows={5} rowsPerPageOptions={[5, 10, 25]}>
                <Column field="id" header="ID" sortable />
                <Column field="x" header="x" sortable />
                <Column field="y" header="y" sortable />
                <Column field="R" header="R" sortable />
                <Column
                    field="inArea"
                    header="Статус"
                    body={(row) => (row.inArea ? '✅' : '❌')}
                    sortable
                />
                <Column field="timestamp" header="Дата броска" sortable />
                <Column
                    field="executionTime"
                    header="Мс"
                    body={(row) => (row.executionTime / 1_000_000).toFixed(2)} // наносек → мс
                />
                <Column field="username" header="Пользователь" sortable />
                <Column body={actionBodyTemplate} header="Действия" />
            </DataTable>
        </>
    )
}