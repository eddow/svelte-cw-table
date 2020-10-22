import {setContext, getContext} from 'svelte';

export const tableContextKey = {};
export const rowContextKey = {};
export const columnContextKey = {};
export enum specialRow {
	header = 'headerRow',
	filter = 'filterRow',
	footer = 'footerRow'
}
export type RowContent<T=any> = specialRow|T;
export interface TableContext<T=any> {
	getData(): T[];
	setFilter(key: any, filter: (row: any)=> boolean);
}
export interface ColumnContext<T=any> {
	setFilter(filter: (value: any)=> boolean);
}
export function setTblCtx(c: TableContext) { setContext(tableContextKey, c); }
export function getTblCtx() { return <TableContext>getContext(tableContextKey); }
export function setClmnCtx(c: ColumnContext) { setContext(columnContextKey, c); }
export function getClmnCtx() { return <ColumnContext>getContext(columnContextKey); }