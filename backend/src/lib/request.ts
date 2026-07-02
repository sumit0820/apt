import { NextRequest, NextResponse } from "next/server";

const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:8080";

export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": CORS_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export function withCors(response: Response) {
  Object.entries(corsHeaders()).forEach(([key, value]) => response.headers.set(key, value));
  return response;
}

export function handleOptions() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function parseJson<T>(request: NextRequest): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
