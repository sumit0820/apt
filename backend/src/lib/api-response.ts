import { NextResponse } from "next/server";
import { withCors } from "@/lib/request";

export function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiJson<T>(data: T, status = 200) {
  return withCors(json(data, status));
}

export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function apiError(message: string, status = 400) {
  return withCors(error(message, status));
}

export function unauthorized(message = "Unauthorized") {
  return error(message, 401);
}

export function forbidden(message = "Forbidden") {
  return error(message, 403);
}

export function notFound(message = "Not found") {
  return error(message, 404);
}

export function serverError(message = "Internal server error") {
  return error(message, 500);
}

export function apiServerError(message = "Internal server error") {
  return withCors(serverError(message));
}

export { withCors };
