import type {KonvaEventObject} from "konva/lib/Node";
import {Image as KonvaImage, Arc, Circle, Group, Layer, Line, Rect, Stage, Text} from "react-konva";
import React, {useEffect, useState} from "react";
import {createPortal} from "react-dom";

const CANVAS_SIZE = 600;
const GRID_UNITS = 3;    // -3 to 3
const GRID_STEP_PX = CANVAS_SIZE / (2 * GRID_UNITS);

const toPixel = (coord: number): number => coord * GRID_STEP_PX;
const toLogical = (pixel: number): number => pixel / GRID_STEP_PX;

export interface SnPoint {
    x: number;
    y: number;
    hit: boolean;
    user_id: number;
    username?: string;
}

export interface SnCanvasProps {
    r: number;
    points?: SnPoint[];
    onPointClick?: (point: SnPoint) => void;
    backgroundImage?: string;
    currentUsername?: string;
    onDeletePoint?: (id: number) => void;
    onDeleteAllPoints?: () => void;
}

export const SnCanvas: React.FC<SnCanvasProps> = ({
    r,
    points = [],
    onPointClick,
    backgroundImage,
    currentUsername,
    onDeletePoint,
    onDeleteAllPoints}) => {

    const [image, setImage] = useState<HTMLImageElement | null>(null);

    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        point?: SnPoint;
    } | null>(null);

    const menuItemStyle: React.CSSProperties = {
        display: 'block',
        width: '100%',
        padding: '6px 12px',
        textAlign: 'left',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
    };

    useEffect(() => {
        if (!backgroundImage) {
            setImage(null);
            return;
        }
        const img = new window.Image();
        img.src = backgroundImage;
        img.onload = () => setImage(img);
        img.onerror = () => console.error("Failed to load background:", backgroundImage);

        const handleClickOutside = () => setContextMenu(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, [backgroundImage]);

    const centerX = CANVAS_SIZE / 2;
    const centerY = CANVAS_SIZE / 2;


    const handleContextMenu = (e: KonvaEventObject<MouseEvent>) => {
        e.evt.preventDefault();

        const stage = e.target.getStage();
        if (!stage) return;

        const pos = stage.getPointerPosition();
        if (!pos) return;

        let clickedPoint: SnPoint | undefined;
        for (const p of points) {
            const dx = (centerX + toPixel(p.x)) - pos.x;
            const dy = (centerY - toPixel(p.y)) - pos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= 3.5 * 2) {
                clickedPoint = p;
                break;
            }
        }

        setContextMenu({
            x: e.evt.clientX,
            y: e.evt.clientY,
            point: clickedPoint,
        });
    };


    const handleClick = (e: KonvaEventObject<MouseEvent>) => {

        if (e.evt.button !== 0) return;

        const stage = e.target.getStage();
        if (!stage) return;

        const pos = stage.getPointerPosition();
        if (!pos) return;

        const logicalX = toLogical(pos.x - centerX);
        const logicalY = toLogical(centerY - pos.y); // инвертируем Y

        // const hit = isInArea(logicalX, logicalY, r);
        const hit = false;
        const point: SnPoint = { x: logicalX, y: logicalY, hit: hit, user_id: 0};

        if (onPointClick) {
            onPointClick(point);
        }
    };

    const renderArea = () => {
        if (r <= 0) return null;
        const fill = '#e0e0e0';
        const stroke = '#888';
        const rPx = toPixel(r);

        return (
            <Group>
                <Group>
                    <Arc
                        x={centerX}
                        y={centerY}
                        innerRadius={0}
                        outerRadius={rPx/2}
                        angle={90}
                        rotation={90}
                        fill={fill}
                        stroke={stroke}
                        opacity={0.8}
                        strokeWidth={0.5}
                    />
                </Group>

                <Rect
                    x={centerX}
                    y={centerY}
                    width={rPx/2}
                    height={-rPx}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={0.5}
                    opacity={0.8}
                />

                <Line
                    points={[
                        centerX, centerY,
                        centerX - rPx, centerY,
                        centerX, centerY - rPx,
                    ]}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={0.5}
                    opacity={0.8}
                    closed
                    fillEnabled
                />
            </Group>
        );
    }

    const renderGrid = () => {
        const lines = [];

        // Линии сетки и подписи
        for (let i = -GRID_UNITS; i <= GRID_UNITS; i++) {
            if (i === 0) continue;

            const xLine = centerX + toPixel(i);
            const yLine = centerY - toPixel(i);

            // Вертикальные линии
            lines.push(
                <Line key={`v-${i}`} points={[xLine, 0, xLine, CANVAS_SIZE]} stroke="#ddd" strokeWidth={0.5} />,
                // Подписи X
                <Text
                    key={`x-label-${i}`}
                    x={xLine - 8}
                    y={centerY + 15}
                    text={i.toString()}
                    fontSize={10}
                    fill="#666"
                />
            );

            // Горизонтальные линии
            lines.push(
                <Line key={`h-${i}`} points={[0, yLine, CANVAS_SIZE, yLine]} stroke="#ddd" strokeWidth={0.5} />,
                // Подписи Y
                <Text
                    key={`y-label-${i}`}
                    x={centerX + 8}
                    y={yLine + 4}
                    text={i.toString()}
                    fontSize={10}
                    fill="#666"
                />
            );
        }

        // Оси
        lines.push(
            <Line key="axis-x" points={[0, centerY, CANVAS_SIZE, centerY]} stroke="black" strokeWidth={2} />,
            <Line key="axis-y" points={[centerX, 0, centerX, CANVAS_SIZE]} stroke="black" strokeWidth={2} />
        );

        // Стрелки
        lines.push(
            <Line
                key="arrow-x"
                points={[CANVAS_SIZE - 10, centerY - 5, CANVAS_SIZE, centerY, CANVAS_SIZE - 10, centerY + 5]}
                fill="black"
                closed
            />,
            <Line
                key="arrow-y"
                points={[centerX - 5, 10, centerX, 0, centerX + 5, 10]}
                fill="black"
                closed
            />
        );

        // Подписи осей
        lines.push(
            <Text key="X" x={CANVAS_SIZE - 15} y={centerY - 10} text="X" fontSize={12} fill="black" />,
            <Text key="Y" x={centerX + 10} y={15} text="Y" fontSize={12} fill="black" />,
            <Text key="O" x={centerX - 15} y={centerY + 15} text="O" fontSize={12} fill="black" />
        );

        return lines;
    };

    // === Точки ===
    const renderPoints = () =>



        points.map((p, i) => {

            let fill = p.hit ? 'green' : 'red';

            if (p.user_id <= 0) {
                fill = "purple";
            }

            return (
            <Circle
                key={i}
                x={centerX + toPixel(p.x)}
                y={centerY - toPixel(p.y)}
                radius={5}
                fill={fill}
            />
        )});

    return (
        <div style={{ display: 'inline-block', margin: '0 auto' }}>
            <Stage
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                onClick={handleClick}
                onContextMenu={handleContextMenu}
            >
                <Layer>
                    {/* Фоновое изображение */}
                    {image && (
                        <KonvaImage
                            image={image}
                            width={CANVAS_SIZE}
                            height={CANVAS_SIZE}
                            opacity={0.3}
                            listening={false} // чтобы не мешал кликам
                        />
                    )}

                    {renderGrid()}
                    {renderArea()}
                    {renderPoints()}
                </Layer>
            </Stage>


            {contextMenu && createPortal(
                <div
                    style={{
                        position: 'fixed',
                        top: contextMenu.y,
                        left: contextMenu.x,
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        zIndex: 1000,
                        padding: '4px 0',
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        setContextMenu(null);
                    }}
                >
                    {contextMenu.point ? (
                        <>
                            <div style={{ padding: '4px 12px', fontSize: '12px', color: '#666' }}>
                                Точка: ({contextMenu.point.x}, {contextMenu.point.y})<br />
                                Пользователь: {contextMenu.point.username}
                            </div>
                            <hr style={{ margin: '4px 0' }} />
                            {contextMenu.point.username === currentUsername && (
                                <button
                                    style={menuItemStyle}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeletePoint!(contextMenu.point!.user_id);
                                        setContextMenu(null);
                                    }}
                                >
                                    Удалить точку
                                </button>
                            )}
                            <button
                                style={menuItemStyle}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteAllPoints!();
                                    setContextMenu(null);
                                }}
                            >
                                Удалить все точки
                            </button>
                        </>
                    ) : (
                        <button
                            style={menuItemStyle}
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteAllPoints!();
                                setContextMenu(null);
                            }}
                        >
                            Удалить все точки
                        </button>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
}