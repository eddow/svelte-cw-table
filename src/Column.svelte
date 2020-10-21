<script lang="ts">
	import {getContext} from "svelte";
	import {header, footer, rowContextKey} from './table'
	//import {writable} from "svelte/store";

	export let prop: string = '';
	export let title: string = '';
	const row: any = getContext(rowContextKey);
	/*let value = prop && typeof row === 'object' && writable(row[prop]);
	if(value) value.subscribe((v: any)=> row[prop] = v);*/
</script>
<template>
	{#if !row}
		<th>`Column` is to be used in a `Table` only</th>
	{:else if row === header}
		<slot name="header">
			<th scope="col">{title || prop}</th>
		</slot>
	{:else if row === footer}
		<slot name="footer">
			<th scope="col" />
		</slot>
	{:else}
		<!--slot value={value}-->
		<slot>
			<td>{row[prop]}</td>
		</slot>
	{/if}
</template>
