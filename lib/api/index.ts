import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { PrismaError } from "./types";

export function isPrismaError(err: unknown): err is PrismaError {
  return typeof (err as PrismaError).message !== "undefined";
}

export function isKnownError(
  err: PrismaError
): err is PrismaClientKnownRequestError {
  return typeof (err as PrismaClientKnownRequestError).code !== "undefined";
}

export const PRISMA_ERRORS: Record<string, string> = {
  P2000: "The provided value for the column is too long for the column's type",
  P2001: "The record searched for does not exist",
  P2002: "Unique constraint failed",
  P2003: "Foreign key constraint failed",
  P2004: "A constraint failed on the database",
  P2005: "The stored value is invalid for the field's type in the database",
  P2006: "The provided value is not valid",
  P2007: "Data validation error",
  P2008: "Failed to parse the query",
  P2009: "Failed to validate the query",
  P2010: "Raw query failed",
  P2011: "Null constraint violation",
  P2012: "Missing a required value",
  P2013: "Missing a required argument",
  P2014:
    "The change you are trying to make would violate the required relation '",
  P2015: "A related record could not be found",
  P2016: "Query interpretation error",
  P2017: "The records for relation",
  P2018: "The required connected records were not found",
  P2019: "Input error",
  P2020: "Value out of range for the type",
  P2021: "The table does not exist in the current database",
  P2022: "The column does not exist in the current database",
  P2023: "Inconsistent column data",
  P2024: "Timed out fetching a new connection from the connection pool",
  P2025:
    "An operation failed because it depends on one or more records that were required but not found",
  P2026:
    "The current database provider doesn't support a feature that the query used",
  P2027: "Multiple errors occurred on the database during query execution",
  P2028: "Transaction API error",
  P2030: "Cannot find a fulltext index to use for the search",
  P2031: "Prisma needs to perform transactions",
  P2033: "A number used in the query does not fit into a 64 bit signed integer",
  P2034: "Transaction failed due to a write conflict or a deadlock",
};
