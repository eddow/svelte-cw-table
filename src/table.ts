import {setContext, getContext} from 'svelte';
import {Readable, Writable} from 'svelte/types/runtime/store';

const tableContextKey = {};
const rowContextKey = {};
const columnContextKey = {};
export enum specialRow {
	header = 'headerRow',
	filter = 'filterRow',
	footer = 'footerRow'
}
export type RowContent<T=any> = specialRow|T;
export interface TableContext<T=any> {
	data: Readable<T[]>;
	setFilter(key: any, filter: (row: T)=> boolean);
}
export interface RowContext<T=any> {
	row: Readable<T>;
}
export interface ColumnContext<T=any> {
	setFilter(filter: (value: T)=> boolean);
	value?: Writable<T>;
}
export function setTblCtx(c: TableContext) { setContext(tableContextKey, c); }
export function getTblCtx() { return <TableContext>getContext(tableContextKey); }
export function setRowCtx(c: RowContext) { setContext(rowContextKey, c); }
export function getRowCtx() { return <RowContext>getContext(rowContextKey); }
export function setClmnCtx(c: ColumnContext) { setContext(columnContextKey, c); }
export function getClmnCtx() { return <ColumnContext>getContext(columnContextKey); }