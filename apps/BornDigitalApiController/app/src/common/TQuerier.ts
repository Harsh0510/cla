import pg, { QueryResultRow } from "pg";

type TArg = string | number | null | undefined | Date;

export type TQuerier<T extends QueryResultRow = QueryResultRow> = (
	query: string,
	values?: TArg[]
) => Promise<pg.QueryResult<T>>;
