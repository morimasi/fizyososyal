import { NextResponse } from "next/server";

export type ApiErrorCode = 
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "SERVER_ERROR"
  | "PARSE_ERROR";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: ApiErrorCode;
  details?: unknown;
}

export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(
  message: string,
  code: ApiErrorCode = "SERVER_ERROR",
  status = 500,
  details?: unknown
): NextResponse<ApiResponse> {
  return NextResponse.json(
    { 
      success: false, 
      error: message, 
      code,
      details: process.env.NODE_ENV === "development" ? details : undefined
    }, 
    { status }
  );
}

export function validationError(details: unknown): NextResponse<ApiResponse> {
  return errorResponse("Validasyon hatası", "VALIDATION_ERROR", 400, details);
}

export function unauthorizedError(message = "Yetkisiz erişim"): NextResponse<ApiResponse> {
  return errorResponse(message, "UNAUTHORIZED", 401);
}

export function forbiddenError(message = "Erişim reddedildi"): NextResponse<ApiResponse> {
  return errorResponse(message, "FORBIDDEN", 403);
}

export function notFoundError(message = "Kaynak bulunamadı"): NextResponse<ApiResponse> {
  return errorResponse(message, "NOT_FOUND", 404);
}

export function rateLimitError(message = "Çok fazla istek"): NextResponse<ApiResponse> {
  return errorResponse(message, "RATE_LIMITED", 429);
}
