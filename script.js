// Obtener elementos del DOM
const canvas = document.getElementById("drawing-canvas");
const ctx = canvas.getContext("2d");
const colorPicker = document.getElementById("color-picker");
const brushSizeInput = document.getElementById("brush-size");
const clearButton = document.getElementById("clear-btn");
const saveButton = document.getElementById("save-btn");
const lineToolButton = document.getElementById("line-tool");
const eraserToolButton = document.getElementById("eraser-tool");
const fillToolButton = document.getElementById("fill-tool"); // Botón de relleno
const pencilToolButton = document.getElementById("pencil-tool"); // Botón del lápiz

// Configurar el tamaño del canvas dinámicamente
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 60; // Ajustar por el toolbar

// Variables iniciales
let isDrawing = false;
let currentTool = "brush"; // Herramienta activa por defecto
let startX, startY; // Coordenadas iniciales para herramientas basadas en clic
let brushColor = "#000000";
let brushSize = 5;

// Herramientas de cambio
lineToolButton.addEventListener("click", () => {
  currentTool = "line";
});
eraserToolButton.addEventListener("click", () => {
  currentTool = "eraser";
});
fillToolButton.addEventListener("click", () => { // Cambiar a la herramienta de relleno
  currentTool = "fill";
});
pencilToolButton.addEventListener("click", () => { // Cambiar a la herramienta de lápiz
  currentTool = "pencil";
});

// Función de Relleno (Flood Fill)
function floodFill(x, y, targetColor, fillColor) {
  if (targetColor === fillColor) return; // No hacer nada si el color es el mismo

  const pixelsToCheck = [{ x, y }];
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const pixelIndex = (x + y * canvas.width) * 4;
  const targetR = data[pixelIndex];
  const targetG = data[pixelIndex + 1];
  const targetB = data[pixelIndex + 2];
  const targetA = data[pixelIndex + 3];

  const checkPixel = (px, py) => {
    const idx = (px + py * canvas.width) * 4;
    return (
      data[idx] === targetR &&
      data[idx + 1] === targetG &&
      data[idx + 2] === targetB &&
      data[idx + 3] === targetA
    );
  };

  while (pixelsToCheck.length > 0) {
    const { x, y } = pixelsToCheck.pop();

    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) continue;
    const idx = (x + y * canvas.width) * 4;

    if (
      data[idx] === targetR &&
      data[idx + 1] === targetG &&
      data[idx + 2] === targetB &&
      data[idx + 3] === targetA
    ) {
      data[idx] = fillColor.r;
      data[idx + 1] = fillColor.g;
      data[idx + 2] = fillColor.b;
      data[idx + 3] = fillColor.a;

      if (x > 0) pixelsToCheck.push({ x: x - 1, y });
      if (x < canvas.width - 1) pixelsToCheck.push({ x: x + 1, y });
      if (y > 0) pixelsToCheck.push({ x, y: y - 1 });
      if (y < canvas.height - 1) pixelsToCheck.push({ x, y: y + 1 });
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

// Función para obtener el color del píxel debajo del cursor
function getPixelColor(x, y) {
  const imageData = ctx.getImageData(x, y, 1, 1);
  const data = imageData.data;
  return `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
}

// Eventos del mouse para las herramientas
canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  startX = e.offsetX;
  startY = e.offsetY;

  if (currentTool === "brush" || currentTool === "eraser" || currentTool === "pencil") {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) return;

  const x = e.offsetX;
  const y = e.offsetY;

  if (currentTool === "brush") {
    ctx.lineTo(x, y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  } else if (currentTool === "eraser") {
    ctx.lineTo(x, y);
    ctx.strokeStyle = "white"; // Color del fondo
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  } else if (currentTool === "pencil") {
    ctx.lineTo(x, y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = 1; // Lápiz de línea fina
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }
});

canvas.addEventListener("mouseup", (e) => {
  isDrawing = false;
  const endX = e.offsetX;
  const endY = e.offsetY;

  if (currentTool === "line") {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.closePath();
  } else if (currentTool === "fill") {
    const fillColor = {
      r: parseInt(brushColor.slice(1, 3), 16),
      g: parseInt(brushColor.slice(3, 5), 16),
      b: parseInt(brushColor.slice(5, 7), 16),
      a: 255
    };
    floodFill(endX, endY, getPixelColor(endX, endY), fillColor); // Rellenar la zona
  }
});

// Cambiar color del pincel
colorPicker.addEventListener("input", (e) => {
  brushColor = e.target.value;
});

// Cambiar tamaño del pincel
brushSizeInput.addEventListener("input", (e) => {
  brushSize = e.target.value;
});

// Limpiar el canvas
clearButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Guardar el dibujo
saveButton.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "Free_BoPaint_Dibujo.png";
  link.href = canvas.toDataURL();
  link.click();
});
