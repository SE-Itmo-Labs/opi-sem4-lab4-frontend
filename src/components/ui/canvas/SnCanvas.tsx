import type {KonvaEventObject} from "konva/lib/Node";
import {Image as KonvaImage, Arc, Circle, Group, Layer, Line, Rect, Stage, Text} from "react-konva";
import React, {useEffect, useState} from "react";

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
}

export interface SnCanvasProps {
    r: number;
    points?: SnPoint[];
    onPointClick?: (point: SnPoint) => void;
    backgroundImage?: string;
}

export const SnCanvas: React.FC<SnCanvasProps> = ({
    r,
    points = [],
    onPointClick,
    backgroundImage}) => {

    const [image, setImage] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        if (!backgroundImage) {
            setImage(null);
            return;
        }
        const img = new window.Image();
        img.src = backgroundImage;
        img.onload = () => setImage(img);
        img.onerror = () => console.error("Failed to load background:", backgroundImage);
    }, [backgroundImage]);

    const centerX = CANVAS_SIZE / 2;
    const centerY = CANVAS_SIZE / 2;


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
            <Stage width={CANVAS_SIZE} height={CANVAS_SIZE} onClick={handleClick}>
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
        </div>
    );
}