import { NextRequest, NextResponse } from "next/server";

const backendUrl = process.env.BACKEND_INTERNAL_URL || "http://localhost:8010";
const HEADERS_TO_FORWARD = ["authorization", "content-type", "cookie", "accept", "accept-language"];

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, context.params, "GET");
}
export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, context.params, "POST");
}
export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, context.params, "PUT");
}
export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, context.params, "DELETE");
}
export async function OPTIONS(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, context.params, "OPTIONS");
}

async function proxyRequest(
  request: NextRequest,
  paramsPromise: Promise<{ path: string[] }>,
  method: string
) {
  const path = (await paramsPromise)?.path;
  const pathSegmen = Array.isArray(path) ? path.join("/") : typeof path === "string" ? path : "";
  const targetUrl = `${backendUrl.replace(/\/$/, "")}/api/${pathSegmen}`;

  const requestHeaders = new Headers();
  HEADERS_TO_FORWARD.forEach((nama) => {
    const nilai = request.headers.get(nama);
    if (nilai) requestHeaders.set(nama, nilai);
  });

  // Penting: multipart/form-data (upload file) harus diteruskan sebagai biner, bukan request.text()
  // agar byte gambar tidak rusak (jadi efbfbd / replacement character).
  const contentTypeReq = request.headers.get("content-type") ?? "";
  const isMultipart = contentTypeReq.toLowerCase().includes("multipart/form-data");

  let body: string | ArrayBuffer | undefined;
  if (method !== "GET" && method !== "HEAD") {
    try {
      if (isMultipart) {
        body = await request.arrayBuffer();
      } else {
        body = await request.text();
        if (body && !requestHeaders.has("content-type")) {
          requestHeaders.set("content-type", contentTypeReq || "application/json");
        }
      }
    } catch {
      body = undefined;
    }
  }

  try {
    const res = await fetch(targetUrl, { method, headers: requestHeaders, body });
    const responseHeaders = new Headers();
    res.headers.forEach((nilai, nama) => responseHeaders.set(nama, nilai));

    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.startsWith("image/") || contentType === "application/octet-stream") {
      return new NextResponse(await res.arrayBuffer(), {
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
      });
    }
    return new NextResponse(await res.text(), {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    const pesan = err instanceof Error ? err.message : "Proxy gagal";
    return NextResponse.json(
      {
        status: false,
        message: pesan.includes("fetch") || pesan.includes("ECONNREFUSED")
          ? "Backend tidak terjangkau. Pastikan backend jalan (docker compose up -d) dan BACKEND_INTERNAL_URL benar."
          : pesan,
      },
      { status: 502 }
    );
  }
}
