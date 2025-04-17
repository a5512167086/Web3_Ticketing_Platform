import { toDataURL } from "qrcode";

export const formatBalance = (rawBalance: string) => {
  const balance = (parseInt(rawBalance) / 1000000000000000000).toFixed(2);
  return balance;
};

export const formatChainAsNum = (chainIdHex: string) => {
  const chainIdNum = parseInt(chainIdHex);
  return chainIdNum;
};

export const formatAddress = (addr: string) => {
  const upperAfterLastTwo = addr.slice(0, 2) + addr.slice(2);
  return `${upperAfterLastTwo.substring(0, 5)}...${upperAfterLastTwo.substring(
    39
  )}`;
};

export async function generateTicketImageBlobJS(options: {
  ticketId: number;
  eventId: number;
  eventName: string;
  qrValue?: string;
}): Promise<Blob> {
  const { ticketId, eventId, eventName, qrValue } = options;

  const background = await loadImage("/ticket-template.jpg");
  const qrDataURL = await toDataURL(qrValue || `ticket:${ticketId}`);
  const qrImage = await loadImage(qrDataURL);

  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 200;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // 🎨 左側文字內容（放大字體 & 垂直置中）
  ctx.fillStyle = "#000";
  ctx.font = "bold 22px 'Arial', sans-serif";
  ctx.textBaseline = "top";

  const lines = [
    `Event Name: ${eventName}`,
    `Event ID: ${eventId}`,
    `Ticket ID: ${ticketId}`,
  ];

  const lineHeight = 34;
  const textStartY = (canvas.height - lines.length * lineHeight) / 2;

  lines.forEach((line, idx) => {
    ctx.fillText(line, 40, textStartY + idx * lineHeight);
  });

  // 📷 QR Code 調整為較大尺寸並垂直置中
  const qrSize = 100;
  const qrX = canvas.width - qrSize - 40;
  const qrY = (canvas.height - qrSize) / 2;
  ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

  return await new Promise((resolve) =>
    canvas.toBlob((blob) => resolve(blob!), "image/png")
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}
